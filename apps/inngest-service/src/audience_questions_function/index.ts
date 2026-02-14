import { generateText, Output } from "ai";
import { z } from "zod";
import { gateway } from "../ai-gateway/client.ts";
import { inngest } from "../inngest/client.ts";
import { AudienceQuestionSchema } from "../schemas/enhanced-types.ts";
import { enhancedDebateStore } from "../state/enhanced-debate-store.ts";

/**
 * Audience Questions Phase
 * AI-generated audience personas ask challenging questions
 * Adds unpredictability and different perspectives
 */
export const audienceQuestionsFunction = inngest.createFunction(
  { id: "audience-questions" },
  { event: "audience/ask-questions" },
  async ({ event, step }) => {
    const { debateId, topic, agents, debateContext } = event.data;

    console.log(`👥 Generating audience questions for: "${topic}"`);

    // Step 1: Generate 3 audience personas with questions
    const audienceQuestions = await step.run("generate-audience-questions", async () => {
      const result = await generateText({
        model: gateway("google/gemini-3-flash"),
        output: Output.object({
          schema: z.object({
            questions: z.array(AudienceQuestionSchema),
          }),
        }),
        prompt: `Generate 3 audience questions for this debate.

DEBATE TOPIC: "${topic}"
AGENTS: ${agents.map((a: any) => `${a.persona} (${a.stance})`).join(", ")}

DEBATE SO FAR:
${JSON.stringify(debateContext, null, 2)}

Create 3 DISTINCT audience personas with different perspectives:

PERSONA 1: Someone directly affected by this topic
- Bias: Slightly pro or con based on personal stake
- Question style: Practical, personal impact focused
- Example: Tech worker worried about job automation

PERSONA 2: Someone with opposite stake
- Bias: Opposite of persona 1
- Question style: Skeptical of bureaucracy or overly cautious
- Example: Startup founder building in this space

PERSONA 3: Neutral expert
- Bias: Neutral but deeply probing
- Question style: Socratic, finds edge cases
- Example: Academic philosopher or ethicist

QUESTION REQUIREMENTS:
- Must be challenging and specific
- Must force agents to be concrete (no hand-waving)
- Should introduce a NEW angle not yet discussed
- Can be slightly provocative or uncomfortable

Example: "You both talk about 'innovation' and 'safety' in the abstract. But I write code for a living. If this regulation passes, do I lose my job next year or in five years? Be specific."

For each persona, provide:
- name, perspective, bias, question_style
- question (the actual question they're asking)
- challenges (pro, con, or both)
- forces_specificity (true/false)`,
      });

      console.log(`✅ Generated ${result.output.questions.length} audience questions`);
      return result.output.questions;
    });

    // Step 2: Get Pro responses
    const proAgent = agents.find((a: any) => a.side === "pro");

    const proResponses = await step.run("get-pro-responses", async () => {
      const responses = [];

      for (const audienceQ of audienceQuestions) {
        const result = await generateText({
          model: gateway("google/gemini-3-flash"),
          prompt: `You are ${proAgent.persona} answering an audience question.

YOUR STANCE: ${proAgent.stance}
YOUR SYSTEM: ${proAgent.systemPrompt}

AUDIENCE QUESTION:
From: ${audienceQ.persona.name} (${audienceQ.persona.perspective})
Question: ${audienceQ.question}

Answer this question:
- Be SPECIFIC (they explicitly asked for specifics)
- Keep it under 100 words
- Address them directly
- Show empathy if it's a personal concern
- Don't dodge - this is the audience, not your opponent

Your answer:`,
        });

        responses.push({
          question: audienceQ.question,
          persona: audienceQ.persona.name,
          answer: result.text,
        });
      }

      console.log(`✅ Pro agent answered ${responses.length} questions`);
      return responses;
    });

    // Step 3: Get Con responses
    const conAgent = agents.find((a: any) => a.side === "con");

    const conResponses = await step.run("get-con-responses", async () => {
      const responses = [];

      for (const audienceQ of audienceQuestions) {
        const result = await generateText({
          model: gateway("google/gemini-3-flash"),
          prompt: `You are ${conAgent.persona} answering an audience question.

YOUR STANCE: ${conAgent.stance}
YOUR SYSTEM: ${conAgent.systemPrompt}

AUDIENCE QUESTION:
From: ${audienceQ.persona.name} (${audienceQ.persona.perspective})
Question: ${audienceQ.question}

Answer this question:
- Be SPECIFIC (they explicitly asked for specifics)
- Keep it under 100 words
- Address them directly
- Show empathy if it's a personal concern
- Don't dodge - this is the audience, not your opponent

Your answer:`,
        });

        responses.push({
          question: audienceQ.question,
          persona: audienceQ.persona.name,
          answer: result.text,
        });
      }

      console.log(`✅ Con agent answered ${responses.length} questions`);
      return responses;
    });

    // Step 4: Store results
    await step.run("store-results", async () => {
      enhancedDebateStore.setAudienceQuestions(debateId, audienceQuestions, proResponses, conResponses);

      enhancedDebateStore.updatePhase(debateId, "audience-questions", "Complete", 1.0);
    });

    // Step 5: Emit completion event
    await step.run("emit-completion", async () => {
      await inngest.send({
        name: "audience/complete",
        data: {
          debateId,
        },
      });
      console.log("✅ Audience questions complete event sent");
    });

    return {
      questions: audienceQuestions,
      proResponses,
      conResponses,
    };
  },
);
