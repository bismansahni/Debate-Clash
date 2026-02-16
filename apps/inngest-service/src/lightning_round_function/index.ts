import { generateText, Output } from "ai";
import { z } from "zod";
import { gateway } from "../ai-gateway/client.ts";
import { inngest } from "../inngest/client.ts";
import { LightningAnswerSchema, LightningQuestionSchema } from "../schemas/enhanced-types.ts";
import { enhancedDebateStore } from "../state/enhanced-debate-store.ts";

/**
 * Lightning Round
 * 2 rapid-fire questions, 10-word answers. No hedging.
 * Questions generated first, then all 4 answers (2 agents x 2 questions) in parallel.
 */
export const lightningRoundFunction = inngest.createFunction(
  { id: "lightning-round" },
  { event: "lightning/start" },
  async ({ event, step, publish }) => {
    const { debateId, topic, agents } = event.data;

    console.log(`⚡ Starting lightning round for: "${topic}"`);

    // Step 1: Generate 2 lightning questions (sequential -- needed before answers)
    const questions = await step.run("generate-lightning-questions", async () => {
      const result = await generateText({
        model: gateway("google/gemini-3-flash"),
        output: Output.object({
          schema: z.object({
            questions: z.array(LightningQuestionSchema),
          }),
        }),
        prompt: `Generate 2 RAPID-FIRE questions for this debate.

DEBATE TOPIC: "${topic}"

These are LIGHTNING questions - short, punchy, force binary choices or hard commitments.

REQUIREMENTS:
- Each question under 15 words
- Forces a clear position (no "it depends")
- Makes agents uncomfortable

Return 2 questions.`,
      });

      console.log(`✅ Generated ${result.output.questions.length} lightning questions`);
      return result.output.questions;
    });

    const proAgent = agents.find((a: any) => a.side === "pro") || agents[0];
    const conAgent = agents.find((a: any) => a.side === "con") || agents[1];

    // Step 2: Fan out all 4 answers in parallel (2 agents x 2 questions)
    const [proAnswer0, proAnswer1, conAnswer0, conAnswer1] = await Promise.all([
      step.run("answer-pro-q0", async () => {
        const result = await generateText({
          model: gateway("google/gemini-3-flash"),
          output: Output.object({ schema: LightningAnswerSchema }),
          prompt: `LIGHTNING ROUND - Answer in 10 words or less. No hedging.

You are ${proAgent.persona.name}.
YOUR STANCE: ${proAgent.stance}

QUESTION: ${questions[0]!.question}

RULES:
- 10 words MAXIMUM
- Be DIRECT - no hedging, no "it depends"
- If the question forces a choice, CHOOSE

Your rapid-fire answer:`,
        });
        console.log(`✅ ${proAgent.persona.name} answered Q1: "${result.output.answer}"`);
        return result.output;
      }),

      step.run("answer-pro-q1", async () => {
        const result = await generateText({
          model: gateway("google/gemini-3-flash"),
          output: Output.object({ schema: LightningAnswerSchema }),
          prompt: `LIGHTNING ROUND - Answer in 10 words or less. No hedging.

You are ${proAgent.persona.name}.
YOUR STANCE: ${proAgent.stance}

QUESTION: ${questions[1]!.question}

RULES:
- 10 words MAXIMUM
- Be DIRECT - no hedging, no "it depends"
- If the question forces a choice, CHOOSE

Your rapid-fire answer:`,
        });
        console.log(`✅ ${proAgent.persona.name} answered Q2: "${result.output.answer}"`);
        return result.output;
      }),

      step.run("answer-con-q0", async () => {
        const result = await generateText({
          model: gateway("google/gemini-3-flash"),
          output: Output.object({ schema: LightningAnswerSchema }),
          prompt: `LIGHTNING ROUND - Answer in 10 words or less. No hedging.

You are ${conAgent.persona.name}.
YOUR STANCE: ${conAgent.stance}

QUESTION: ${questions[0]!.question}

RULES:
- 10 words MAXIMUM
- Be DIRECT - no hedging, no "it depends"
- If the question forces a choice, CHOOSE

Your rapid-fire answer:`,
        });
        console.log(`✅ ${conAgent.persona.name} answered Q1: "${result.output.answer}"`);
        return result.output;
      }),

      step.run("answer-con-q1", async () => {
        const result = await generateText({
          model: gateway("google/gemini-3-flash"),
          output: Output.object({ schema: LightningAnswerSchema }),
          prompt: `LIGHTNING ROUND - Answer in 10 words or less. No hedging.

You are ${conAgent.persona.name}.
YOUR STANCE: ${conAgent.stance}

QUESTION: ${questions[1]!.question}

RULES:
- 10 words MAXIMUM
- Be DIRECT - no hedging, no "it depends"
- If the question forces a choice, CHOOSE

Your rapid-fire answer:`,
        });
        console.log(`✅ ${conAgent.persona.name} answered Q2: "${result.output.answer}"`);
        return result.output;
      }),
    ]);

    const allAnswers = {
      pro: [proAnswer0, proAnswer1],
      con: [conAnswer0, conAnswer1],
    };

    // Step 3: Identify concessions
    const concessions = await step.run("identify-concessions", async () => {
      const allConcessions: string[] = [];

      [...allAnswers.pro, ...allAnswers.con].forEach((answer: any, idx: number) => {
        if (answer.concession_made) {
          const agent = idx < allAnswers.pro.length ? proAgent.persona : conAgent.persona;
          allConcessions.push(`${agent.name}: ${answer.answer}`);
        }
      });

      return allConcessions;
    });

    // Step 4: Store results + publish
    await step.run("store-results", async () => {
      const lightningData = {
        questions,
        proAnswers: allAnswers.pro,
        conAnswers: allAnswers.con,
        concessionsMade: concessions,
      };

      enhancedDebateStore.setLightningRound(debateId, lightningData);
      enhancedDebateStore.updatePhase(debateId, "lightning-round", "Complete", 1.0);

      await publish({
        channel: `debate:${debateId}`,
        topic: "updates",
        data: { type: "lightning", data: lightningData },
      });
    });

    // Step 5: Emit completion event
    await step.run("emit-completion", async () => {
      await inngest.send({
        name: "lightning/complete",
        data: { debateId },
      });
      console.log("✅ Lightning round complete event sent");
    });

    return {
      questions,
      answers: allAnswers,
      concessions,
    };
  },
);
