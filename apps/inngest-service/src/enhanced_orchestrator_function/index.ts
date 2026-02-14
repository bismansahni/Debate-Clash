import { inngest } from "../inngest/client.ts";
import { generateText, Output } from "ai";
import { gateway } from "../ai-gateway/client.ts";
import { DebateAnalysisSchema } from "../schemas/enhanced-types.ts";
import { enhancedDebateStore } from "../state/enhanced-debate-store.ts";
import { AgentPersonaSchema } from "../schemas/enhanced-types.ts";
import { z } from "zod";

/**
 * Enhanced Debate Orchestrator
 * Manages the complete multi-phase debate flow:
 * 1. Pre-Show → 2. Research → 3. Opening → 4. Cross-Exam →
 * 5. Rebuttals → 6. Audience Q&A → 7. Lightning → 8. Closing →
 * 9. Deliberation → 10. Verdict → 11. Synthesis
 */
export const enhancedOrchestrator = inngest.createFunction(
    { id: "enhanced-debate-orchestrator" },
    { event: "debate/initiate-enhanced" },
    async ({ event, step }) => {
        const topic = event.data.topic;

        console.log(`\n${'='.repeat(60)}`);
        console.log(`🎭 ENHANCED DEBATE ORCHESTRATOR`);
        console.log(`📋 Topic: "${topic}"`);
        console.log(`${'='.repeat(60)}\n`);

        // Generate deterministic debate ID
        const debateId = await step.run("generate-debate-id", async () => {
            const id = `debate-${event.id}`;

            enhancedDebateStore.set(id, {
                topic,
                status: 'preparing',
                currentPhase: {
                    type: 'preparing',
                    progress: 0
                },
                phases: {}
            });

            // Initialize momentum tracking
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
2. Agent positions needed (2-4 agents with their roles, stances, and personas)
3. Number of rounds needed (2-4 based on complexity)
4. Complexity level
5. Whether agents need a research phase

Create INTERESTING personas with personality, not generic "Agent A" / "Agent B":
- Give them names and backgrounds
- Make them distinct (different speaking styles, approaches)
- Example: "Dr. Sarah Chen, AI ethics researcher" vs "Prof. Alex Kumar, innovation economist"

Make personas that will CLASH interestingly.`
            });

            const analysis = analysisResult.output;

            // Create rich agent personas
            console.log(`🤖 Creating ${analysis.positions.length} agents with full personas...`);

            const agentList = await Promise.all(
                analysis.positions.map(async (position, index) => {
                    const personaResult = await generateText({
                        model: gateway("google/gemini-3-flash"),
                        output: Output.object({
                            schema: AgentPersonaSchema
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

Make them feel HUMAN, not robotic. They should have a distinct voice.

Example good output:
{
  "name": "Dr. Sarah Chen",
  "age": 42,
  "background": "Former tech executive turned AI safety advocate after witnessing harmful deployment practices",
  "traits": {
    "speaking_style": "Passionate but measured, uses analogies from history",
    "emotional_range": "Concerned → Urgent → Resolute",
    "rhetoric_preference": "Historical parallels, rhetorical questions, personal anecdotes",
    "tone": "Authoritative but not condescending, like a concerned expert warning of danger",
    "catchphrases": ["Let me be clear", "Here's what they won't tell you", "History shows us"],
    "weaknesses": "Can be slightly alarmist, sometimes overrelies on historical examples"
  },
  "motivation": "Saw AI safety concerns dismissed in her tech career, now determined to prevent catastrophic outcomes",
  "debate_style": {
    "opening_move": "Establish stakes with emotional hook",
    "argumentation": "Logos (logic) + Pathos (emotion) + Ethos (credibility)",
    "engagement_with_opponent": "Respectful but firm, anticipates counterarguments",
    "closing_move": "Rhetorical question that reframes the entire debate"
  }
}`
                    });

                    // Explicitly label pro/con based on index
                    // First agent is always pro, second is always con
                    const side = index === 0 ? 'pro' : 'con';

                    return {
                        id: `agent-${index + 1}`,
                        position: position.role,
                        stance: position.stance,
                        side: side,
                        persona: personaResult.output,
                        systemPrompt: generateSystemPrompt(personaResult.output, position.stance, topic)
                    };
                })
            );

            enhancedDebateStore.set(debateId, {
                analysis,
                agents: agentList
            });

            console.log(`✅ Agents created:`, agentList.map(a => `${a.persona.name} (${a.side})`).join(', '));

            return { analysis, agents: agentList };
        });

        // Step 2: Generate Pre-Show Content
        await step.run("trigger-pre-show", async () => {
            console.log(`\n🎬 Phase 1: PRE-SHOW`);

            await inngest.send({
                name: "pre-show/generate",
                data: {
                    debateId,
                    topic,
                    analysis,
                    agents
                }
            });
        });

        // Wait for pre-show to complete
        await step.waitForEvent("wait-for-pre-show", {
            event: "pre-show/complete",
            timeout: "2m",
            if: `async.data.debateId == "${debateId}"`
        });

        // Step 3: Research Phase (if needed)
        if (analysis.needsResearch) {
            console.log(`\n🔬 Phase 2: RESEARCH MONTAGE`);

            enhancedDebateStore.initResearchMontage(debateId);
            enhancedDebateStore.updatePhase(debateId, 'researching', 'In Progress', 0);

            // Trigger research for each agent
            await step.run("trigger-research", async () => {
                const researchEvents = agents.map(agent => ({
                    name: "agent/research",
                    data: {
                        debateId,
                        topic,
                        aspect: agent.stance.toLowerCase().includes("pro") ? "pro" : "con",
                        persona: agent.persona.name
                    }
                }));

                await inngest.send(researchEvents);
            });

            // Wait for research
            await Promise.all(
                agents.map((agent) =>
                    step.waitForEvent(`wait-for-research-${agent.id}`, {
                        event: "agent/research-complete",
                        timeout: "5m",
                        if: `async.data.debateId == "${debateId}" && async.data.persona == "${agent.persona.name}"`
                    })
                )
            );

            enhancedDebateStore.completeResearchMontage(debateId);
            console.log(`✅ Research phase complete`);
        }

        // Step 4: Opening Statements
        console.log(`\n🎤 Phase 3: OPENING STATEMENTS`);
        enhancedDebateStore.updatePhase(debateId, 'opening-statements', 'Starting', 0);

        await step.run("trigger-opening-statements", async () => {
            await inngest.send({
                name: "opening/start",
                data: {
                    debateId,
                    topic,
                    agents,
                    research: enhancedDebateStore.get(debateId)?.researchMontage?.findings
                }
            });
        });

        await step.waitForEvent("wait-for-opening", {
            event: "opening/complete",
            timeout: "5m",
            if: `async.data.debateId == "${debateId}"`
        });

        // Step 5: Cross-Examination
        console.log(`\n⚔️ Phase 4: CROSS-EXAMINATION`);
        enhancedDebateStore.updatePhase(debateId, 'cross-examination', 'Round 1', 0);

        const proAgent = agents.find(a => a.side === 'pro');
        const conAgent = agents.find(a => a.side === 'con');

        // Round 1: Pro questions Con
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
                        opponentArguments: enhancedDebateStore.get(debateId)?.phases.openingStatements?.conStatement
                    }
                }
            });
        });

        await step.waitForEvent("wait-cross-exam-1", {
            event: "cross-exam/complete",
            timeout: "5m",
            if: `async.data.debateId == "${debateId}" && async.data.roundNum == 1`
        });

        // Round 2: Con questions Pro
        enhancedDebateStore.updatePhase(debateId, 'cross-examination', 'Round 2', 0.5);

        await step.run("cross-exam-round-2", async () => {
            await inngest.send({
                name: "cross-exam/start",
                data: {
                    debateId,
                    roundNum: 2,
                    questioner: conAgent,
                    respondent: proAgent,
                    context: {
                        topic,
                        opponentArguments: enhancedDebateStore.get(debateId)?.phases.openingStatements?.proStatement
                    }
                }
            });
        });

        await step.waitForEvent("wait-cross-exam-2", {
            event: "cross-exam/complete",
            timeout: "5m",
            if: `async.data.debateId == "${debateId}" && async.data.roundNum == 2`
        });

        // Step 6: Rebuttals
        console.log(`\n🔄 Phase 5: REBUTTALS`);
        enhancedDebateStore.updatePhase(debateId, 'rebuttals', 'In Progress', 0);

        await step.run("trigger-rebuttals", async () => {
            await inngest.send({
                name: "rebuttals/start",
                data: {
                    debateId,
                    topic,
                    agents,
                    debateContext: enhancedDebateStore.get(debateId)
                }
            });
        });

        await step.waitForEvent("wait-rebuttals", {
            event: "rebuttals/complete",
            timeout: "5m",
            if: `async.data.debateId == "${debateId}"`
        });

        // Step 7: Audience Questions
        console.log(`\n👥 Phase 6: AUDIENCE QUESTIONS`);
        enhancedDebateStore.updatePhase(debateId, 'audience-questions', 'In Progress', 0);

        await step.run("trigger-audience-questions", async () => {
            await inngest.send({
                name: "audience/ask-questions",
                data: {
                    debateId,
                    topic,
                    agents,
                    debateContext: enhancedDebateStore.get(debateId)
                }
            });
        });

        await step.waitForEvent("wait-audience", {
            event: "audience/complete",
            timeout: "5m",
            if: `async.data.debateId == "${debateId}"`
        });

        // Step 8: Lightning Round
        console.log(`\n⚡ Phase 7: LIGHTNING ROUND`);
        enhancedDebateStore.updatePhase(debateId, 'lightning-round', 'In Progress', 0);

        await step.run("trigger-lightning", async () => {
            await inngest.send({
                name: "lightning/start",
                data: {
                    debateId,
                    topic,
                    agents
                }
            });
        });

        await step.waitForEvent("wait-lightning", {
            event: "lightning/complete",
            timeout: "5m",
            if: `async.data.debateId == "${debateId}"`
        });

        // Step 9: Closing Statements
        console.log(`\n🎬 Phase 8: CLOSING STATEMENTS`);
        enhancedDebateStore.updatePhase(debateId, 'closing-statements', 'In Progress', 0);

        await step.run("trigger-closing", async () => {
            await inngest.send({
                name: "closing/start",
                data: {
                    debateId,
                    topic,
                    agents,
                    debateContext: enhancedDebateStore.get(debateId)
                }
            });
        });

        await step.waitForEvent("wait-closing", {
            event: "closing/complete",
            timeout: "5m",
            if: `async.data.debateId == "${debateId}"`
        });

        // Step 10: Judge Deliberation
        console.log(`\n⚖️ Phase 9: JUDGE DELIBERATION`);
        enhancedDebateStore.updatePhase(debateId, 'deliberation', 'In Progress', 0);

        await step.run("trigger-deliberation", async () => {
            await inngest.send({
                name: "judges/deliberate",
                data: {
                    debateId,
                    debateData: enhancedDebateStore.get(debateId)
                }
            });
        });

        await step.waitForEvent("wait-deliberation", {
            event: "judges/deliberation-complete",
            timeout: "5m",
            if: `async.data.debateId == "${debateId}"`
        });

        // Step 11: Verdict
        console.log(`\n🏆 Phase 10: VERDICT`);
        enhancedDebateStore.updatePhase(debateId, 'verdict', 'Revealing Scores', 0);

        await step.run("trigger-verdict", async () => {
            await inngest.send({
                name: "judges/score",
                data: {
                    debateId,
                    debateData: enhancedDebateStore.get(debateId)
                }
            });
        });

        await step.waitForEvent("wait-verdict", {
            event: "judges/verdict-complete",
            timeout: "5m",
            if: `async.data.debateId == "${debateId}"`
        });

        // Step 12: Synthesis
        console.log(`\n📖 Phase 11: SYNTHESIS`);
        enhancedDebateStore.updatePhase(debateId, 'synthesis', 'Generating', 0);

        await step.run("trigger-synthesis", async () => {
            await inngest.send({
                name: "synthesis/generate",
                data: {
                    debateId,
                    debateData: enhancedDebateStore.get(debateId)
                }
            });
        });

        await step.waitForEvent("wait-synthesis", {
            event: "synthesis/complete",
            timeout: "5m",
            if: `async.data.debateId == "${debateId}"`
        });

        // Complete!
        enhancedDebateStore.updatePhase(debateId, 'completed', 'Finished', 1.0);

        console.log(`\n${'='.repeat(60)}`);
        console.log(`✅ DEBATE COMPLETE!`);
        console.log(`${'='.repeat(60)}\n`);

        return {
            message: "Enhanced debate completed successfully!",
            debateId,
            topic,
            status: "completed"
        };
    }
);

// Helper function to generate system prompts
function generateSystemPrompt(persona: any, stance: string, topic: string): string {
    return `You are ${persona.name}, a ${persona.age}-year-old ${persona.background}.

YOUR VOICE:
- Speaking style: ${persona.traits.speaking_style}
- Emotional range: ${persona.traits.emotional_range}
- Rhetoric preferences: ${persona.traits.rhetoric_preference}
- Tone: ${persona.traits.tone}
${persona.traits.catchphrases ? `- Catchphrases: ${persona.traits.catchphrases.join(', ')}` : ''}
${persona.traits.weaknesses ? `- Weaknesses: ${persona.traits.weaknesses}` : ''}

YOUR MOTIVATION:
${persona.motivation}

YOUR DEBATE STYLE:
- Opening move: ${persona.debate_style.opening_move}
- Argumentation: ${persona.debate_style.argumentation}
- Engagement with opponent: ${persona.debate_style.engagement_with_opponent}
- Closing move: ${persona.debate_style.closing_move}

YOUR STANCE ON "${topic}":
${stance}

CRITICAL RULES:
✓ Use first person ("I argue", "I've witnessed")
✓ Address the audience ("you", "we", "ask yourself")
✓ Show passion but stay credible
✓ Use contractions (I'm, we're, they'll) - sound natural
✓ Vary sentence length (short for impact, long for explanation)
✗ DO NOT sound like a research paper
✗ DO NOT be boring
✗ DO NOT use jargon without explanation

Remember: You're not writing a paper. You're performing for an audience. Make them FEEL the stakes.`;
}
