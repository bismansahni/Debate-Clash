import { generateText, Output } from "ai";
import { gateway } from "../ai-gateway/client.ts";
import { inngest } from "../inngest/client.ts";
import { PunchyStatementSchema } from "../schemas/enhanced-types.ts";
import { enhancedDebateStore } from "../state/enhanced-debate-store.ts";
import { detectControversyMoments } from "../utils/controversy-detector.ts";
import { calculateMomentumShift } from "../utils/momentum-tracker.ts";

/**
 * Opening Statements Phase
 * Each agent delivers ONE punchy sentence -- their entire position in a tweet.
 * Pro and Con run in parallel (no dependency between them).
 */
export const openingStatementsFunction = inngest.createFunction(
  { id: "opening-statements" },
  { event: "opening/start" },
  async ({ event, step, publish }) => {
    const { debateId, topic, agents } = event.data;

    console.log(`🎤 OPENING STATEMENTS: "${topic}"`);

    const proAgent = agents.find((a: any) => a.side === "pro");
    const conAgent = agents.find((a: any) => a.side === "con");

    if (!proAgent || !conAgent) {
      throw new Error("Could not identify Pro and Con agents");
    }

    // Run Pro + Con generation in parallel
    const [proStatement, conStatement] = await Promise.all([
      step.run("generate-pro-opening", async () => {
        console.log(`✍️  Generating ${proAgent.persona.name}'s opening...`);

        const result = await generateText({
          model: gateway("google/gemini-3-flash"),
          output: Output.object({
            schema: PunchyStatementSchema,
          }),
          prompt: `${proAgent.systemPrompt}

DEBATE TOPIC: "${topic}"
YOUR STANCE: ${proAgent.stance}
PHASE: Opening Statement

Give ONE punchy sentence that captures your entire position. Maximum 20 words.

Say it like you'd say it to someone's face — raw, real, no fancy words. Use contractions. No semicolons. No academic language.

Also provide the emotional tone of your statement (e.g. "passionate", "measured", "urgent", "defiant").`,
        });

        console.log(`✅ Pro opening: "${result.output.statement}"`);
        return result.output;
      }),

      step.run("generate-con-opening", async () => {
        console.log(`✍️  Generating ${conAgent.persona.name}'s opening...`);

        const result = await generateText({
          model: gateway("google/gemini-3-flash"),
          output: Output.object({
            schema: PunchyStatementSchema,
          }),
          prompt: `${conAgent.systemPrompt}

DEBATE TOPIC: "${topic}"
YOUR STANCE: ${conAgent.stance}
PHASE: Opening Statement

Give ONE punchy sentence that captures your entire position. Maximum 20 words.

Say it like you'd say it to someone's face — raw, real, no fancy words. Use contractions. No semicolons. No academic language.

Also provide the emotional tone of your statement (e.g. "passionate", "measured", "urgent", "defiant").`,
        });

        console.log(`✅ Con opening: "${result.output.statement}"`);
        return result.output;
      }),
    ]);

    // Store + track + publish Pro
    await step.run("store-pro-opening", async () => {
      const shift = calculateMomentumShift(proStatement, "opening-statements-pro");
      enhancedDebateStore.addMomentumEvent(debateId, shift);

      const moments = detectControversyMoments(proStatement, proAgent.persona.name);
      moments.forEach((m) => enhancedDebateStore.addControversyMoment(debateId, m));

      const proData = {
        agent: proAgent.persona.name,
        statement: proStatement.statement,
        tone: proStatement.tone,
        timestamp: Date.now(),
      };
      enhancedDebateStore.setOpeningStatement(debateId, "pro", proData);

      await publish({
        channel: `debate:${debateId}`,
        topic: "updates",
        data: { type: "opening", side: "pro", data: proData },
      });

      await publish({
        channel: `debate:${debateId}`,
        topic: "updates",
        data: { type: "momentum", data: enhancedDebateStore.get(debateId)?.momentum },
      });
    });

    // Store + track + publish Con
    await step.run("store-con-opening", async () => {
      const shift = calculateMomentumShift(conStatement, "opening-statements-con");
      enhancedDebateStore.addMomentumEvent(debateId, shift);

      const moments = detectControversyMoments(conStatement, conAgent.persona.name);
      moments.forEach((m) => enhancedDebateStore.addControversyMoment(debateId, m));

      const conData = {
        agent: conAgent.persona.name,
        statement: conStatement.statement,
        tone: conStatement.tone,
        timestamp: Date.now(),
      };
      enhancedDebateStore.setOpeningStatement(debateId, "con", conData);
      enhancedDebateStore.updatePhase(debateId, "opening-statements", "Complete", 1.0);

      await publish({
        channel: `debate:${debateId}`,
        topic: "updates",
        data: { type: "opening", side: "con", data: conData },
      });

      await publish({
        channel: `debate:${debateId}`,
        topic: "updates",
        data: { type: "momentum", data: enhancedDebateStore.get(debateId)?.momentum },
      });
    });

    // Emit completion event
    await step.run("emit-completion", async () => {
      await inngest.send({
        name: "opening/complete",
        data: { debateId },
      });

      console.log(`✅ Opening statements complete!`);
    });

    return {
      proStatement,
      conStatement,
    };
  },
);
