import { generateText, Output } from "ai";
import { gateway } from "../ai-gateway/client.ts";
import { inngest } from "../inngest/client.ts";
import { AgentPersonaSchema, DebateAnalysisSchema } from "../schemas/enhanced-types.ts";
import { enhancedDebateStore } from "../state/enhanced-debate-store.ts";

/**
 * Enhanced Debate Orchestrator (One-Liner Edition)
 * 6-phase flow: Opening -> Cross-Exam -> Rebuttals -> Lightning -> Closing -> Verdict
 */
export const enhancedOrchestrator = inngest.createFunction(
  { id: "enhanced-debate-orchestrator" },
  { event: "debate/initiate-enhanced" },
  async ({ event, step, publish }) => {
    const topic = event.data.topic;

    console.log(`\n${"=".repeat(60)}`);
    console.log(`🎭 DEBATE ORCHESTRATOR (One-Liner Edition)`);
    console.log(`📋 Topic: "${topic}"`);
    console.log(`${"=".repeat(60)}\n`);

    // Generate deterministic debate ID
    const debateId = await step.run("generate-debate-id", async () => {
      const id = `debate-${event.id}`;

      enhancedDebateStore.set(id, {
        topic,
        status: "preparing",
        currentPhase: {
          type: "preparing",
          progress: 0,
        },
        phases: {},
      });

      enhancedDebateStore.initMomentum(id);

      console.log(`✅ Debate ID: ${id}`);
      return id;
    });

    // Step 1: Analyze topic and create agent personas
    const { analysis, agents } = await step.run("analyze-and-create-agents", async () => {
      console.log(`📊 Analyzing topic...`);

      const analysisResult = await generateText({
        model: gateway("google/gemini-3-flash"),
        output: Output.object({
          schema: DebateAnalysisSchema,
        }),
        prompt: `Analyze this debate topic and determine the best debate structure:

Topic: "${topic}"

Provide:
1. Debate type (binary for yes/no, multi-perspective for complex issues, comparison for A vs B)
2. Agent positions needed (2 agents with their roles, stances, and personas)
3. Number of rounds needed (2-4 based on complexity)
4. Complexity level
5. Whether agents need a research phase (always set to false -- we skip research)

Create INTERESTING personas with personality, not generic "Agent A" / "Agent B":
- Give them names and backgrounds
- Make them distinct (different speaking styles, approaches)

Make personas that will CLASH interestingly.`,
      });

      const analysis = analysisResult.output;

      console.log(`🤖 Creating ${analysis.positions.length} agents with full personas...`);

      const agentList = await Promise.all(
        analysis.positions.map(async (position, index) => {
          const personaResult = await generateText({
            model: gateway("google/gemini-3-flash"),
            output: Output.object({
              schema: AgentPersonaSchema,
            }),
            prompt: `Create a detailed persona for this debate agent:

ROLE: ${position.role}
STANCE: ${position.stance}
BASE PERSONA: ${position.persona}

TOPIC: "${topic}"

Create a RICH personality:
- Name, age, background
- Speaking style, emotional range, rhetoric preferences
- Tone, catchphrases, weaknesses
- Motivation for their position
- Debate style (opening move, argumentation, engagement tactics, closing move)

Make them feel HUMAN, not robotic. They should have a distinct voice.`,
          });

          const side = index === 0 ? "pro" : "con";

          return {
            id: `agent-${index + 1}`,
            position: position.role,
            stance: position.stance,
            side: side,
            persona: personaResult.output,
            systemPrompt: generateSystemPrompt(personaResult.output, position.stance, topic),
          };
        }),
      );

      enhancedDebateStore.set(debateId, {
        analysis,
        agents: agentList,
      });

      console.log(`✅ Agents created:`, agentList.map((a) => `${a.persona.name} (${a.side})`).join(", "));

      return { analysis, agents: agentList };
    });

    // Publish init data (agents, analysis, topic)
    await step.run("publish-init", async () => {
      await publish({
        channel: `debate:${debateId}`,
        topic: "updates",
        data: {
          type: "init",
          data: { debateId, topic, agents, analysis },
        },
      });
    });

    // Step 2: Opening Statements
    console.log(`\n🎤 Phase 1: OPENING STATEMENTS`);
    enhancedDebateStore.updatePhase(debateId, "opening-statements", "Starting", 0);

    await step.run("trigger-opening-statements", async () => {
      await inngest.send({
        name: "opening/start",
        data: {
          debateId,
          topic,
          agents,
        },
      });
    });

    await step.waitForEvent("wait-for-opening", {
      event: "opening/complete",
      timeout: "5m",
      if: `async.data.debateId == "${debateId}"`,
    });

    // Publish status: opening complete
    await step.run("publish-status-after-opening", async () => {
      await publish({
        channel: `debate:${debateId}`,
        topic: "updates",
        data: { type: "status", data: { phase: "cross-examination", progress: 0 } },
      });
    });

    // Step 3: Cross-Examination (1 round only -- Pro questions Con)
    console.log(`\n⚔️ Phase 2: CROSS-EXAMINATION`);
    enhancedDebateStore.updatePhase(debateId, "cross-examination", "Round 1", 0);

    const proAgent = agents.find((a) => a.side === "pro");
    const conAgent = agents.find((a) => a.side === "con");

    await step.run("cross-exam-round-1", async () => {
      await inngest.send({
        name: "cross-exam/start",
        data: {
          debateId,
          roundNum: 1,
          questioner: proAgent,
          respondent: conAgent,
          context: {
            topic,
            opponentArguments: enhancedDebateStore.get(debateId)?.phases.openingStatements?.conStatement,
          },
        },
      });
    });

    await step.waitForEvent("wait-cross-exam-1", {
      event: "cross-exam/complete",
      timeout: "5m",
      if: `async.data.debateId == "${debateId}" && async.data.roundNum == 1`,
    });

    // Publish status: cross-exam complete
    await step.run("publish-status-after-crossexam", async () => {
      await publish({
        channel: `debate:${debateId}`,
        topic: "updates",
        data: { type: "status", data: { phase: "rebuttals", progress: 0 } },
      });
    });

    // Step 4: Rebuttals
    console.log(`\n🔄 Phase 3: REBUTTALS`);
    enhancedDebateStore.updatePhase(debateId, "rebuttals", "In Progress", 0);

    await step.run("trigger-rebuttals", async () => {
      await inngest.send({
        name: "rebuttals/start",
        data: {
          debateId,
          topic,
          agents,
          debateContext: enhancedDebateStore.get(debateId),
        },
      });
    });

    await step.waitForEvent("wait-rebuttals", {
      event: "rebuttals/complete",
      timeout: "5m",
      if: `async.data.debateId == "${debateId}"`,
    });

    // Publish status: rebuttals complete
    await step.run("publish-status-after-rebuttals", async () => {
      await publish({
        channel: `debate:${debateId}`,
        topic: "updates",
        data: { type: "status", data: { phase: "lightning-round", progress: 0 } },
      });
    });

    // Step 5: Lightning Round
    console.log(`\n⚡ Phase 4: LIGHTNING ROUND`);
    enhancedDebateStore.updatePhase(debateId, "lightning-round", "In Progress", 0);

    await step.run("trigger-lightning", async () => {
      await inngest.send({
        name: "lightning/start",
        data: {
          debateId,
          topic,
          agents,
        },
      });
    });

    await step.waitForEvent("wait-lightning", {
      event: "lightning/complete",
      timeout: "5m",
      if: `async.data.debateId == "${debateId}"`,
    });

    // Publish status: lightning complete
    await step.run("publish-status-after-lightning", async () => {
      await publish({
        channel: `debate:${debateId}`,
        topic: "updates",
        data: { type: "status", data: { phase: "closing-statements", progress: 0 } },
      });
    });

    // Step 6: Closing Statements
    console.log(`\n🎬 Phase 5: CLOSING STATEMENTS`);
    enhancedDebateStore.updatePhase(debateId, "closing-statements", "In Progress", 0);

    await step.run("trigger-closing", async () => {
      await inngest.send({
        name: "closing/start",
        data: {
          debateId,
          topic,
          agents,
          debateContext: enhancedDebateStore.get(debateId),
        },
      });
    });

    await step.waitForEvent("wait-closing", {
      event: "closing/complete",
      timeout: "5m",
      if: `async.data.debateId == "${debateId}"`,
    });

    // Publish status: closing complete
    await step.run("publish-status-after-closing", async () => {
      await publish({
        channel: `debate:${debateId}`,
        topic: "updates",
        data: { type: "status", data: { phase: "verdict", progress: 0 } },
      });
    });

    // Step 7: Verdict
    console.log(`\n🏆 Phase 6: VERDICT`);
    enhancedDebateStore.updatePhase(debateId, "verdict", "Revealing Scores", 0);

    await step.run("trigger-verdict", async () => {
      await inngest.send({
        name: "judges/score",
        data: {
          debateId,
          debateData: enhancedDebateStore.get(debateId),
        },
      });
    });

    await step.waitForEvent("wait-verdict", {
      event: "judges/verdict-complete",
      timeout: "5m",
      if: `async.data.debateId == "${debateId}"`,
    });

    // Complete!
    enhancedDebateStore.updatePhase(debateId, "completed", "Finished", 1.0);

    // Publish completed status
    await step.run("publish-status-completed", async () => {
      await publish({
        channel: `debate:${debateId}`,
        topic: "updates",
        data: { type: "status", data: { phase: "completed", progress: 1.0 } },
      });
    });

    console.log(`\n${"=".repeat(60)}`);
    console.log(`✅ DEBATE COMPLETE!`);
    console.log(`${"=".repeat(60)}\n`);

    return {
      message: "Debate completed successfully!",
      debateId,
      topic,
      status: "completed",
    };
  },
);

// Helper function to generate system prompts
function generateSystemPrompt(persona: any, stance: string, topic: string): string {
  return `You are ${persona.name}, a ${persona.age}-year-old ${persona.background}.

YOUR VOICE:
- Speaking style: ${persona.traits.speaking_style}
- Emotional range: ${persona.traits.emotional_range}
- Rhetoric preferences: ${persona.traits.rhetoric_preference}
- Tone: ${persona.traits.tone}
${persona.traits.catchphrases ? `- Catchphrases: ${persona.traits.catchphrases.join(", ")}` : ""}
${persona.traits.weaknesses ? `- Weaknesses: ${persona.traits.weaknesses}` : ""}

YOUR MOTIVATION:
${persona.motivation}

YOUR DEBATE STYLE:
- Opening move: ${persona.debate_style.opening_move}
- Argumentation: ${persona.debate_style.argumentation}
- Engagement with opponent: ${persona.debate_style.engagement_with_opponent}
- Closing move: ${persona.debate_style.closing_move}

YOUR STANCE ON "${topic}":
${stance}

CRITICAL RULES — SOUND LIKE A REAL HUMAN TALKING:
✓ ONE sentence only. Short. Punchy.
✓ Talk like you're in a heated bar argument, not a courtroom
✓ Use contractions (don't, can't, won't, that's)
✓ Use everyday words — say "look" not "I've found that", say "wrong" not "introduces fatal inconsistency"
✓ Show raw emotion — anger, passion, frustration, conviction
✓ Be specific and concrete, not abstract and flowery
✗ NEVER use semicolons
✗ NEVER use academic/formal phrasing ("I've audited", "legacy system variable", "biological noise")
✗ NEVER sound like a research paper, a policy document, or a robot
✗ NEVER start with "I've" followed by a formal verb

GOOD examples: "Come on, machines don't have bad days — that's the whole point."
BAD examples: "I've audited your mercy and found only biological noise; the pulse you prize is a legacy system variable."`;
}
