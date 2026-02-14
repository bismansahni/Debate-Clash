import { inngest } from "../inngest/client.ts";
import { generateText, Output } from "ai";
import { gateway } from "../ai-gateway/client.ts";
import { LightningQuestionSchema, LightningAnswerSchema } from "../schemas/enhanced-types.ts";
import { enhancedDebateStore } from "../state/enhanced-debate-store.ts";
import { z } from "zod";

/**
 * Lightning Round
 * Rapid-fire tough questions that force quick, direct answers
 * Creates tension and can force concessions
 */
export const lightningRoundFunction = inngest.createFunction(
    { id: "lightning-round" },
    { event: "lightning/start" },
    async ({ event, step }) => {
        const { debateId, topic, agents } = event.data;

        console.log(`⚡ Starting lightning round for: "${topic}"`);

        // Step 1: Generate lightning questions
        const questions = await step.run("generate-lightning-questions", async () => {
            const result = await generateText({
                model: gateway("google/gemini-3-flash"),
                output: Output.object({
                    schema: z.object({
                        questions: z.array(LightningQuestionSchema)
                    })
                }),
                prompt: `Generate 4 RAPID-FIRE questions for this debate.

DEBATE TOPIC: "${topic}"

These are LIGHTNING questions - short, punchy, force binary choices or hard commitments.

REQUIREMENTS:
- Each question under 20 words
- Forces a clear position (no "it depends" or "both/and")
- Makes agents uncomfortable
- Reveals their true priorities or red lines

QUESTION TYPES:
1. Binary choice: "If you had to choose: safety or speed?"
2. Commitment test: "Name ONE regulation you'd oppose"
3. Red line: "At what point would you change your position? Be specific."
4. Gotcha: "You said X earlier. Does that mean you support Y?"

Example questions:
- "Is ANY level of AI risk acceptable? Yes or no."
- "Name ONE historical regulation that actually prevented progress entirely."
- "If your approach fails, what's your red line for admitting it?"
- "Would you rather: slow AI with safety, or fast AI with risk?"

For each question:
- question (the actual question)
- time_limit_seconds (30 or 60)
- forces_position (true/false)

Return 4 questions that will make agents squirm.`
            });

            console.log(`✅ Generated ${result.output.questions.length} lightning questions`);
            return result.output.questions;
        });

        // Step 2: Get rapid responses from both agents
        const allAnswers = await step.run("get-all-answers", async () => {
            const answerSets = {
                pro: [] as any[],
                con: [] as any[]
            };

            for (const agent of agents) {
                const side = agent.side as 'pro' | 'con'; // Use explicit side field

                for (const question of questions) {
                    const result = await generateText({
                        model: gateway("google/gemini-3-flash"),
                        output: Output.object({
                            schema: LightningAnswerSchema
                        }),
                        prompt: `LIGHTNING ROUND - Answer in ${question.time_limit_seconds} seconds or less!

You are ${agent.persona.name}.
YOUR STANCE: ${agent.stance}

QUESTION: ${question.question}

RULES:
- Maximum ${question.time_limit_seconds === 30 ? '50' : '100'} words
- Be DIRECT - no hedging, no "it depends"
- If the question forces a choice, CHOOSE
- If it asks for a red line, GIVE ONE
- If it asks for an example, NAME ONE

If you must make a concession, do it quickly and move on.

Your rapid-fire answer:`
                    });

                    const answer = result.output;

                    answerSets[side].push(answer);

                    console.log(`✅ ${agent.persona.name} answered: "${answer.answer.substring(0, 50)}..."`);
                }
            }

            return answerSets;
        });

        // Step 3: Identify concessions
        const concessions = await step.run("identify-concessions", async () => {
            const allConcessions: string[] = [];

            [...allAnswers.pro, ...allAnswers.con].forEach((answer: any, idx: number) => {
                if (answer.concession_made) {
                    const agent = idx < allAnswers.pro.length ? agents[0].persona : agents[1].persona;
                    allConcessions.push(`${agent}: ${answer.answer}`);
                }
            });

            console.log(`🎯 Identified ${allConcessions.length} concessions`);
            return allConcessions;
        });

        // Step 4: Store results
        await step.run("store-results", async () => {
            enhancedDebateStore.setLightningRound(debateId, {
                questions,
                proAnswers: allAnswers.pro,
                conAnswers: allAnswers.con,
                concessionsMade: concessions
            });

            enhancedDebateStore.updatePhase(debateId, 'lightning-round', 'Complete', 1.0);
        });

        // Step 5: Emit completion event
        await step.run("emit-completion", async () => {
            await inngest.send({
                name: "lightning/complete",
                data: {
                    debateId
                }
            });
            console.log("✅ Lightning round complete event sent");
        });

        return {
            questions,
            answers: allAnswers,
            concessions
        };
    }
);
