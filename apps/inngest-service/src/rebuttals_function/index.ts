import { generateText, Output } from "ai";
import { gateway } from "../ai-gateway/client.ts";
import { inngest } from "../inngest/client.ts";
import { EnhancedArgumentSchema } from "../schemas/enhanced-types.ts";
import { enhancedDebateStore } from "../state/enhanced-debate-store.ts";
import { detectControversyMoments } from "../utils/controversy-detector.ts";
import { calculateMomentumShift } from "../utils/momentum-tracker.ts";

/**
 * Rebuttals Phase
 * Direct responses to opponent's case with quotes and engagement
 */
export const rebuttalsFunction = inngest.createFunction(
  { id: "rebuttals-phase" },
  { event: "rebuttals/start" },
  async ({ event, step }) => {
    const { debateId, topic, agents, debateContext } = event.data;

    console.log(`🔄 REBUTTALS PHASE: Direct engagement`);

    const proAgent = agents.find((a: any) => a.side === "pro");
    const conAgent = agents.find((a: any) => a.side === "con");

    // Get opening statements for context
    const proOpening = debateContext.phases?.openingStatements?.proStatement;
    const conOpening = debateContext.phases?.openingStatements?.conStatement;

    // Step 1: Pro Rebuttal
    const proRebuttal = await step.run("generate-pro-rebuttal", async () => {
      console.log(`✍️  ${proAgent.persona.name}'s rebuttal...`);

      const result = await generateText({
        model: gateway("google/gemini-3-flash"),
        output: Output.object({
          schema: EnhancedArgumentSchema,
        }),
        prompt: `${proAgent.systemPrompt}

DEBATE TOPIC: "${topic}"
YOUR STANCE: ${proAgent.stance}
PHASE: REBUTTAL (Directly respond to opponent's arguments)

OPPONENT'S OPENING:
${JSON.stringify(conOpening, null, 2)}

OPPONENT'S CROSS-EXAM PERFORMANCE:
${JSON.stringify(debateContext.phases?.crossExamination, null, 2)}

YOUR TASK: Respond to their case directly.

REBUTTAL REQUIREMENTS:

1. OPENING (Hook that references opponent):
   - "My opponent claims X, but here's what they're missing..."
   - Must engage with their actual argument

2. MAIN POINTS (3 direct responses):
   For each point:
   - QUOTE your opponent directly: "When Professor Kumar said '...' "
   - SHOW why they're wrong OR incomplete
   - PROVIDE your counter-evidence
   - Use rhetorical devices to make it memorable

3. DIRECT ENGAGEMENT (REQUIRED):
   - opponentQuote: Direct quote from their argument
   - response: Your response (2-3 sentences)
   - tone: Choose aggressive, dismissive, respectful, sarcastic, or collaborative

4. NEW ANGLE (If needed):
   - Introduce ONE new perspective they haven't considered
   - But primarily respond to what they said

5. PERSONAL ELEMENT:
   - Address their stance from your experience
   - "In my 15 years studying this, I've seen this argument before..."

6. CONCLUSION:
   - Rhetorical question or reframe that shows their position's weakness
   - Callback to their opening if possible

CRITICAL RULES:
✓ MUST quote opponent at least 3 times
✓ Directly address their strongest point (don't dodge it)
✓ Show engagement, not just parallel arguments
✓ If they made a good point, acknowledge then pivot
✗ DO NOT ignore what they said
✗ DO NOT just repeat your opening

This is about RESPONSE, not repetition.`,
      });

      console.log(`✅ Pro rebuttal generated`);
      return result.output;
    });

    // Step 2: Track Pro rebuttal
    await step.run("track-pro-rebuttal", async () => {
      const shift = calculateMomentumShift(proRebuttal, "rebuttals-pro");
      enhancedDebateStore.addMomentumEvent(debateId, shift);

      const moments = detectControversyMoments(proRebuttal, proAgent.persona.name);
      moments.forEach((m) => enhancedDebateStore.addControversyMoment(debateId, m));

      enhancedDebateStore.setRebuttal(debateId, "pro", {
        agent: proAgent.persona.name,
        rebuttal: proRebuttal,
        timestamp: Date.now(),
      });
    });

    console.log(`\n${"─".repeat(60)}\n`);

    // Step 3: Con Rebuttal
    const conRebuttal = await step.run("generate-con-rebuttal", async () => {
      console.log(`✍️  ${conAgent.persona.name}'s rebuttal...`);

      const result = await generateText({
        model: gateway("google/gemini-3-flash"),
        output: Output.object({
          schema: EnhancedArgumentSchema,
        }),
        prompt: `${conAgent.systemPrompt}

DEBATE TOPIC: "${topic}"
YOUR STANCE: ${conAgent.stance}
PHASE: REBUTTAL (Directly respond to opponent's arguments)

OPPONENT'S OPENING:
${JSON.stringify(proOpening, null, 2)}

OPPONENT'S REBUTTAL TO YOU:
${JSON.stringify(proRebuttal, null, 2)}

OPPONENT'S CROSS-EXAM PERFORMANCE:
${JSON.stringify(debateContext.phases?.crossExamination, null, 2)}

YOUR TASK: Respond to their case AND their rebuttal to you.

[Same requirements as Pro rebuttal prompt above]

ADDITIONAL:
- You can respond to their rebuttal of you
- Show where their response to you failed
- But ALSO address their original opening

This is your chance to defend your position and attack theirs.`,
      });

      console.log(`✅ Con rebuttal generated`);
      return result.output;
    });

    // Step 4: Track Con rebuttal
    await step.run("track-con-rebuttal", async () => {
      const shift = calculateMomentumShift(conRebuttal, "rebuttals-con");
      enhancedDebateStore.addMomentumEvent(debateId, shift);

      const moments = detectControversyMoments(conRebuttal, conAgent.persona.name);
      moments.forEach((m) => enhancedDebateStore.addControversyMoment(debateId, m));

      enhancedDebateStore.setRebuttal(debateId, "con", {
        agent: conAgent.persona.name,
        rebuttal: conRebuttal,
        timestamp: Date.now(),
      });

      enhancedDebateStore.updatePhase(debateId, "rebuttals", "Complete", 1.0);
    });

    // Step 5: Emit completion
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
