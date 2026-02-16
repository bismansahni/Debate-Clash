import { generateText, Output } from "ai";
import { gateway } from "../ai-gateway/client.ts";
import { inngest } from "../inngest/client.ts";
import { PunchyStatementSchema } from "../schemas/enhanced-types.ts";
import { enhancedDebateStore } from "../state/enhanced-debate-store.ts";

/**
 * Closing Statements Phase
 * One mic-drop line each. The line people remember.
 * Pro and Con run in parallel (no dependency between them).
 */
export const closingStatementsFunction = inngest.createFunction(
  { id: "closing-statements" },
  { event: "closing/start" },
  async ({ event, step, publish }) => {
    const { debateId, topic, agents, debateContext } = event.data;

    console.log(`🎬 CLOSING STATEMENTS: Mic drop time`);

    const proAgent = agents.find((a: any) => a.side === "pro");
    const conAgent = agents.find((a: any) => a.side === "con");

    // Run Pro + Con closings in parallel
    const [proClosing, conClosing] = await Promise.all([
      step.run("generate-pro-closing", async () => {
        console.log(`✍️  ${proAgent.persona.name}'s closing statement...`);

        const result = await generateText({
          model: gateway("google/gemini-3-flash"),
          output: Output.object({
            schema: PunchyStatementSchema,
          }),
          prompt: `${proAgent.systemPrompt}

DEBATE TOPIC: "${topic}"
YOUR STANCE: ${proAgent.stance}
PHASE: CLOSING STATEMENT (Final words)

One final sentence. Your mic drop. The line people remember. Maximum 20 words.

Say it like you mean it — plain words, real emotion, something a human would actually say out loud. Use contractions. No semicolons.

Also provide the emotional tone (e.g. "resolute", "defiant", "hopeful", "urgent").`,
        });

        console.log(`✅ Pro closing: "${result.output.statement}"`);
        return result.output;
      }),

      step.run("generate-con-closing", async () => {
        console.log(`✍️  ${conAgent.persona.name}'s closing statement...`);

        const result = await generateText({
          model: gateway("google/gemini-3-flash"),
          output: Output.object({
            schema: PunchyStatementSchema,
          }),
          prompt: `${conAgent.systemPrompt}

DEBATE TOPIC: "${topic}"
YOUR STANCE: ${conAgent.stance}
PHASE: CLOSING STATEMENT (Final words)

One final sentence. Your mic drop. The line people remember. Maximum 20 words.

Say it like you mean it — plain words, real emotion, something a human would actually say out loud. Use contractions. No semicolons.

Also provide the emotional tone (e.g. "resolute", "defiant", "hopeful", "urgent").`,
        });

        console.log(`✅ Con closing: "${result.output.statement}"`);
        return result.output;
      }),
    ]);

    // Store + publish Pro closing
    await step.run("store-pro-closing", async () => {
      const proData = {
        agent: proAgent.persona.name,
        statement: proClosing.statement,
        tone: proClosing.tone,
        timestamp: Date.now(),
      };
      enhancedDebateStore.setClosingStatement(debateId, "pro", proData);

      await publish({
        channel: `debate:${debateId}`,
        topic: "updates",
        data: { type: "closing", side: "pro", data: proData },
      });
    });

    // Store + publish Con closing
    await step.run("store-con-closing", async () => {
      const conData = {
        agent: conAgent.persona.name,
        statement: conClosing.statement,
        tone: conClosing.tone,
        timestamp: Date.now(),
      };
      enhancedDebateStore.setClosingStatement(debateId, "con", conData);
      enhancedDebateStore.updatePhase(debateId, "closing-statements", "Complete", 1.0);

      await publish({
        channel: `debate:${debateId}`,
        topic: "updates",
        data: { type: "closing", side: "con", data: conData },
      });
    });

    // Emit completion
    await step.run("emit-completion", async () => {
      await inngest.send({
        name: "closing/complete",
        data: { debateId },
      });

      console.log(`✅ Closing statements complete!`);
    });

    return {
      conClosing,
      proClosing,
    };
  },
);
