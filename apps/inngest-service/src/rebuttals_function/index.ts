import { generateText, Output } from "ai";
import { gateway } from "../ai-gateway/client.ts";
import { inngest } from "../inngest/client.ts";
import { PunchyStatementSchema } from "../schemas/enhanced-types.ts";
import { enhancedDebateStore } from "../state/enhanced-debate-store.ts";
import { detectControversyMoments } from "../utils/controversy-detector.ts";
import { calculateMomentumShift } from "../utils/momentum-tracker.ts";

/**
 * Rebuttals Phase
 * One sentence each -- hit back hard.
 * Pro and Con run in parallel (both rebut opponent's opening only).
 */
export const rebuttalsFunction = inngest.createFunction(
  { id: "rebuttals-phase" },
  { event: "rebuttals/start" },
  async ({ event, step, publish }) => {
    const { debateId, topic, agents, debateContext } = event.data;

    console.log(`🔄 REBUTTALS PHASE: Direct engagement`);

    const proAgent = agents.find((a: any) => a.side === "pro");
    const conAgent = agents.find((a: any) => a.side === "con");

    const proOpening = debateContext.phases?.openingStatements?.proStatement;
    const conOpening = debateContext.phases?.openingStatements?.conStatement;

    // Run Pro + Con rebuttals in parallel (both rebut opponent's opening)
    const [proRebuttal, conRebuttal] = await Promise.all([
      step.run("generate-pro-rebuttal", async () => {
        console.log(`✍️  ${proAgent.persona.name}'s rebuttal...`);

        const opponentStatement = conOpening?.statement || JSON.stringify(conOpening);

        const result = await generateText({
          model: gateway("google/gemini-3-flash"),
          output: Output.object({
            schema: PunchyStatementSchema,
          }),
          prompt: `${proAgent.systemPrompt}

DEBATE TOPIC: "${topic}"
YOUR STANCE: ${proAgent.stance}
PHASE: REBUTTAL

Your opponent said: "${opponentStatement}"

Hit back with ONE sentence. Maximum 25 words. Call out exactly what's wrong with what they said.

Talk like a real person arguing — casual, direct, emotional. Use contractions. No semicolons. No academic language.

Also provide the emotional tone of your rebuttal (e.g. "aggressive", "dismissive", "sarcastic", "measured").`,
        });

        console.log(`✅ Pro rebuttal: "${result.output.statement}"`);
        return result.output;
      }),

      step.run("generate-con-rebuttal", async () => {
        console.log(`✍️  ${conAgent.persona.name}'s rebuttal...`);

        const opponentStatement = proOpening?.statement || JSON.stringify(proOpening);

        const result = await generateText({
          model: gateway("google/gemini-3-flash"),
          output: Output.object({
            schema: PunchyStatementSchema,
          }),
          prompt: `${conAgent.systemPrompt}

DEBATE TOPIC: "${topic}"
YOUR STANCE: ${conAgent.stance}
PHASE: REBUTTAL

Your opponent said: "${opponentStatement}"

Hit back with ONE sentence. Maximum 25 words. Call out exactly what's wrong with what they said.

Talk like a real person arguing — casual, direct, emotional. Use contractions. No semicolons. No academic language.

Also provide the emotional tone of your rebuttal (e.g. "aggressive", "dismissive", "sarcastic", "measured").`,
        });

        console.log(`✅ Con rebuttal: "${result.output.statement}"`);
        return result.output;
      }),
    ]);

    // Store + track + publish Pro rebuttal
    await step.run("track-pro-rebuttal", async () => {
      const shift = calculateMomentumShift(proRebuttal, "rebuttals-pro");
      enhancedDebateStore.addMomentumEvent(debateId, shift);

      const moments = detectControversyMoments(proRebuttal, proAgent.persona.name);
      moments.forEach((m) => enhancedDebateStore.addControversyMoment(debateId, m));

      const proData = {
        agent: proAgent.persona.name,
        rebuttal: proRebuttal.statement,
        tone: proRebuttal.tone,
        timestamp: Date.now(),
      };
      enhancedDebateStore.setRebuttal(debateId, "pro", proData);

      await publish({
        channel: `debate:${debateId}`,
        topic: "updates",
        data: { type: "rebuttal", side: "pro", data: proData },
      });

      await publish({
        channel: `debate:${debateId}`,
        topic: "updates",
        data: { type: "momentum", data: enhancedDebateStore.get(debateId)?.momentum },
      });
    });

    // Store + track + publish Con rebuttal
    await step.run("track-con-rebuttal", async () => {
      const shift = calculateMomentumShift(conRebuttal, "rebuttals-con");
      enhancedDebateStore.addMomentumEvent(debateId, shift);

      const moments = detectControversyMoments(conRebuttal, conAgent.persona.name);
      moments.forEach((m) => enhancedDebateStore.addControversyMoment(debateId, m));

      const conData = {
        agent: conAgent.persona.name,
        rebuttal: conRebuttal.statement,
        tone: conRebuttal.tone,
        timestamp: Date.now(),
      };
      enhancedDebateStore.setRebuttal(debateId, "con", conData);
      enhancedDebateStore.updatePhase(debateId, "rebuttals", "Complete", 1.0);

      await publish({
        channel: `debate:${debateId}`,
        topic: "updates",
        data: { type: "rebuttal", side: "con", data: conData },
      });

      await publish({
        channel: `debate:${debateId}`,
        topic: "updates",
        data: { type: "momentum", data: enhancedDebateStore.get(debateId)?.momentum },
      });
    });

    // Emit completion
    await step.run("emit-completion", async () => {
      await inngest.send({
        name: "rebuttals/complete",
        data: { debateId },
      });

      console.log(`✅ Rebuttals complete!`);
    });

    return {
      proRebuttal,
      conRebuttal,
    };
  },
);
