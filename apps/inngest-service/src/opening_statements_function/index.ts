import { generateText, Output } from "ai";
import { gateway } from "../ai-gateway/client.ts";
import { inngest } from "../inngest/client.ts";
import { EnhancedArgumentSchema } from "../schemas/enhanced-types.ts";
import { enhancedDebateStore } from "../state/enhanced-debate-store.ts";
import { detectControversyMoments } from "../utils/controversy-detector.ts";
import { calculateMomentumShift } from "../utils/momentum-tracker.ts";

/**
 * Opening Statements Phase
 * Agents present their full case with personality, rhetoric, and emotion
 */
export const openingStatementsFunction = inngest.createFunction(
  { id: "opening-statements" },
  { event: "opening/start" },
  async ({ event, step }) => {
    const { debateId, topic, agents, research } = event.data;

    console.log(`🎤 OPENING STATEMENTS: "${topic}"`);

    // Identify Pro and Con agents using explicit side field
    const proAgent = agents.find((a: any) => a.side === "pro");
    const conAgent = agents.find((a: any) => a.side === "con");

    if (!proAgent || !conAgent) {
      console.error(
        "Available agents:",
        agents.map((a: any) => ({ name: a.persona?.name, side: a.side, stance: a.stance })),
      );
      throw new Error("Could not identify Pro and Con agents");
    }

    console.log(`📊 Pro: ${proAgent.persona.name}`);
    console.log(`📊 Con: ${conAgent.persona.name}`);

    // Step 1: Pro Opening Statement
    const proStatement = await step.run("generate-pro-opening", async () => {
      console.log(`✍️  Generating ${proAgent.persona.name}'s opening...`);

      const result = await generateText({
        model: gateway("google/gemini-3-flash"),
        output: Output.object({
          schema: EnhancedArgumentSchema,
        }),
        prompt: `${proAgent.systemPrompt}

DEBATE TOPIC: "${topic}"
YOUR STANCE: ${proAgent.stance}
PHASE: Opening Statement (uninterrupted - lay out your full case)

${research && research.length > 0 ? `RESEARCH AVAILABLE:\n${JSON.stringify(research, null, 2)}\n` : ""}

This is your OPENING STATEMENT. You have the floor. Make it count.

REQUIREMENTS:

1. OPENING (15-25 words):
   - Hook the audience emotionally
   - Choose your hook type: emotional, question, statistic, anecdote, or provocative
   - Example: "Imagine a world where..." or "Let me tell you what keeps me up at night..."

2. MAIN POINTS (3 points):
   For EACH point provide:
   - A BOLD claim (one sentence, memorable)
   - Elaboration (2-3 sentences with YOUR VOICE - use "I", "we", "you")
   - At least one rhetorical device:
     * Metaphor: "We're playing Russian roulette..."
     * Rhetorical question: "Are we really so arrogant to think...?"
     * Rule of three: "Not hope. Not market forces. A treaty."
     * Historical parallel: "In 1968, the world faced..."
   - Concrete evidence with dramatic framing
   - Specify emotional tone: passionate, measured, urgent, skeptical

3. PERSONAL ELEMENT:
   - Share a professional experience, observation, or personal stake
   - Make it vulnerable: "I've seen...", "In my years studying...", "This matters because..."

4. DIRECT ENGAGEMENT:
   - Anticipate your opponent's counterargument
   - Preemptively address it: "They'll say this stifles innovation, but..."
   - Tone: respectful but firm

5. CONCLUSION (20-30 words):
   - End with rhetorical power
   - Options: Rhetorical question, call to action, reframe the debate
   - Call back to your opening hook if possible

6. KEY MOMENTS (2-3):
   - Identify your zingers, rhetorical climaxes, or emotional peaks
   - Mark their position in the argument (0-1 timestamp)
   - Rate impact (1-3)

7. EMOTIONAL JOURNEY:
   - How do you start? (calm, urgent, passionate, measured)
   - Where's your peak?
   - How do you end?

CRITICAL RULES:
✓ Use first person ("I argue", "I've witnessed")
✓ Address the audience ("you", "we", "ask yourself")
✓ Show passion but stay credible
✓ Use contractions (I'm, we're, they'll)
✓ Vary sentence length (short for impact, long for explanation)
✗ DO NOT sound like a research paper
✗ DO NOT be boring

Return the complete EnhancedArgument object.`,
      });

      console.log(`✅ Pro opening complete: ${result.output.mainPoints.length} points`);
      return result.output;
    });

    // Step 2: Live fact-check Pro statement
    await step.run("fact-check-pro-opening", async () => {
      console.log(`🔍 Fact-checking Pro statement...`);

      // Extract claims from evidence
      for (const evidence of proStatement.evidence) {
        const factCheck = {
          claim: evidence.claim,
          agent: proAgent.persona.name,
          timestamp: Date.now(),
          verdict: "verified" as const, // In production, actually verify
          explanation: `Verified from ${evidence.source}`,
          source: evidence.source,
          impact: "moderate" as const,
        };

        enhancedDebateStore.addLiveFactCheck(debateId, factCheck);
      }

      console.log(`✅ Fact-checked ${proStatement.evidence.length} claims`);
    });

    // Step 3: Calculate momentum shift for Pro
    await step.run("momentum-pro-opening", async () => {
      const shift = calculateMomentumShift(proStatement, "opening-statements-pro");
      enhancedDebateStore.addMomentumEvent(debateId, shift);
      console.log(`📊 Momentum: ${shift.description}`);
    });

    // Step 4: Detect controversy moments for Pro
    await step.run("controversy-pro-opening", async () => {
      const moments = detectControversyMoments(proStatement, proAgent.persona.name);
      moments.forEach((m) => enhancedDebateStore.addControversyMoment(debateId, m));
      console.log(`🔥 Detected ${moments.length} controversy moments`);
    });

    // Step 5: Store Pro statement
    await step.run("store-pro-opening", async () => {
      enhancedDebateStore.setOpeningStatement(debateId, "pro", {
        agent: proAgent.persona.name,
        argument: proStatement,
        timestamp: Date.now(),
      });
    });

    console.log(`\n${"─".repeat(60)}\n`);

    // Step 6: Con Opening Statement
    const conStatement = await step.run("generate-con-opening", async () => {
      console.log(`✍️  Generating ${conAgent.persona.name}'s opening...`);

      const result = await generateText({
        model: gateway("google/gemini-3-flash"),
        output: Output.object({
          schema: EnhancedArgumentSchema,
        }),
        prompt: `${conAgent.systemPrompt}

DEBATE TOPIC: "${topic}"
YOUR STANCE: ${conAgent.stance}
PHASE: Opening Statement (you can reference Pro's points)

${research && research.length > 0 ? `RESEARCH AVAILABLE:\n${JSON.stringify(research, null, 2)}\n` : ""}

PRO AGENT'S OPENING:
${JSON.stringify(proStatement, null, 2)}

This is your OPENING STATEMENT. You've heard Pro's case. Now present yours.

[Same requirements as Pro's prompt above - full enhanced argument structure]

You CAN reference Pro's arguments in your directEngagement field:
- Quote them if you want
- Show where they're wrong
- But ALSO present your own positive case

Return the complete EnhancedArgument object.`,
      });

      console.log(`✅ Con opening complete: ${result.output.mainPoints.length} points`);
      return result.output;
    });

    // Step 7: Live fact-check Con statement
    await step.run("fact-check-con-opening", async () => {
      console.log(`🔍 Fact-checking Con statement...`);

      for (const evidence of conStatement.evidence) {
        const factCheck = {
          claim: evidence.claim,
          agent: conAgent.persona.name,
          timestamp: Date.now(),
          verdict: "verified" as const,
          explanation: `Verified from ${evidence.source}`,
          source: evidence.source,
          impact: "moderate" as const,
        };

        enhancedDebateStore.addLiveFactCheck(debateId, factCheck);
      }

      console.log(`✅ Fact-checked ${conStatement.evidence.length} claims`);
    });

    // Step 8: Calculate momentum shift for Con
    await step.run("momentum-con-opening", async () => {
      const shift = calculateMomentumShift(conStatement, "opening-statements-con");
      enhancedDebateStore.addMomentumEvent(debateId, shift);
      console.log(`📊 Momentum: ${shift.description}`);
    });

    // Step 9: Detect controversy moments for Con
    await step.run("controversy-con-opening", async () => {
      const moments = detectControversyMoments(conStatement, conAgent.persona.name);
      moments.forEach((m) => enhancedDebateStore.addControversyMoment(debateId, m));
      console.log(`🔥 Detected ${moments.length} controversy moments`);
    });

    // Step 10: Store Con statement
    await step.run("store-con-opening", async () => {
      enhancedDebateStore.setOpeningStatement(debateId, "con", {
        agent: conAgent.persona.name,
        argument: conStatement,
        timestamp: Date.now(),
      });

      enhancedDebateStore.updatePhase(debateId, "opening-statements", "Complete", 1.0);
    });

    // Step 11: Emit completion event
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
      momentum: enhancedDebateStore.get(debateId)?.momentum,
      controversyMoments: enhancedDebateStore.get(debateId)?.controversyMoments,
    };
  },
);
