import { inngest } from "../inngest/client.ts";
import { generateText, Output } from "ai";
import { gateway } from "../ai-gateway/client.ts";
import { EnhancedSynthesisSchema } from "../schemas/enhanced-types.ts";
import { enhancedDebateStore } from "../state/enhanced-debate-store.ts";
import { rankControversyMoments } from "../utils/controversy-detector.ts";

/**
 * Enhanced Synthesis Agent
 * Creates narrative storytelling summary instead of bullet points
 */
export const enhancedSynthesisFunction = inngest.createFunction(
    { id: "enhanced-synthesis" },
    { event: "synthesis/generate" },
    async ({ event, step }) => {
        const { debateId, debateData } = event.data;

        console.log(`📖 ENHANCED SYNTHESIS: Creating narrative story`);

        enhancedDebateStore.updatePhase(debateId, 'synthesis', 'Generating', 0);

        // Extract winner info
        const finalScore = debateData.phases.verdict?.finalScore;
        const winner = finalScore?.winner || "Unknown";
        const margin = finalScore?.margin || 0;

        const synthesis = await step.run("generate-synthesis", async () => {
            const result = await generateText({
                model: gateway("google/gemini-3-flash"),
                output: Output.object({
                    schema: EnhancedSynthesisSchema
                }),
                prompt: `You are a master storyteller analyzing this debate.

COMPLETE DEBATE DATA:
${JSON.stringify(debateData, null, 2)}

WINNER: ${winner} (by ${margin} points)

Your task: Turn this intellectual combat into a NARRATIVE that reveals something true about the topic and human nature.

CREATE:

1. NARRATIVE (Tell the story in 4 acts):

   A. OPENING (1-2 sentences):
      What was this debate REALLY about? (Deeper than surface topic)
      Set up the narrative arc.
      Example: "What started as a clash over AI regulation became a deeper question about human nature itself."

   B. ACT 1 - SETUP (2-3 sentences):
      How it started (initial positions, opening moves)
      Example: "Dr. Chen opened with fear—productive fear, the kind that kept our ancestors alive. Prof. Kumar pushed back with optimism grounded in human adaptability..."

   C. ACT 2 - CONFLICT (2-3 sentences):
      The clash (where they disagreed, what was at stake)
      Highlight the tension and key exchanges
      Example: "The cross-examination revealed the fault lines: Can we innovate AND be safe? Kumar's dodge on the timeline question showed the weakness..."

   D. ACT 3 - RESOLUTION (2-3 sentences):
      Where it landed (resolution, common ground, lingering questions)
      Example: "In the end, both agreed on one thing: the status quo is unacceptable. But they diverged on whether caution or speed was the greater risk..."

   E. THEMES (3-5 bigger ideas):
      What larger themes emerged beyond the topic?
      Example: "Progress vs. Precaution (the eternal tension)", "The role of fear in policy-making"

2. BEST ARGUMENTS (both sides):

   PRO:
   - argument: Which specific argument worked best?
   - why_it_worked: Why was it effective? (rhetoric, evidence, timing?)
   - quote: The memorable line from it

   CON:
   - argument: Which specific argument worked best?
   - why_it_worked: Why was it effective?
   - quote: The memorable line from it

3. OPEN QUESTIONS (3-5 unanswered questions):
   What questions are still unresolved?
   Example: "How do we balance speed and safety without sacrificing either?"

4. TAKEAWAYS (For different audience perspectives):

   - if_you_agreed_with_pro: "You value caution over speed. You see AI as potentially existential..."
   - if_you_agreed_with_con: "You value innovation over precaution. You see AI as tool, not threat..."
   - the_synthesis: "Perhaps the question isn't 'regulate or not' but 'how do we regulate without killing what we're trying to protect?'"

5. WINNER (Narrative, not just numbers):

   - who: Winner's name
   - margin: "X points" or "Close call" or "Decisive victory"
   - why: NOT just "higher score" - WHY did they win? What did they do better?
         Example: "Not because they were right—we may never know—but because they made you feel the stakes. They turned data into drama."
   - defining_moment: The single moment that sealed it
                       Example: "The closing question: 'Are we really so arrogant to think we don't need guardrails?' That lingered."

6. FURTHER EXPLORATION (3-5 suggested next debates):
   What should we debate next to go deeper?
   Example: "Who should write AI regulations: Technologists, governments, or the public?"

STYLE:
- Write like you're explaining this debate to a smart friend over coffee
- Use vivid language but stay grounded
- Quote specific moments (with speaker names)
- Find the humanity in the argument
- Make readers THINK, not just consume

This isn't a summary. This is a story about ideas in combat.`
            });

            console.log(`✅ Synthesis generated`);
            console.log(`   Winner narrative: "${result.output.winner.why.substring(0, 80)}..."`);

            return result.output;
        });

        // Generate highlights for sharing
        const highlights = await step.run("generate-highlights", async () => {
            const controversyMoments = debateData.controversyMoments || [];
            const topControversies = rankControversyMoments(controversyMoments).slice(0, 5);

            // Extract best quotes from key moments
            const bestMoments = topControversies.map((moment: any) => ({
                text: moment.clip,
                agent: moment.agent,
                phase: "debate",
                type: moment.type
            }));

            // Extract top quotes from arguments
            const allArguments = [
                ...(debateData.phases.openingStatements?.proStatement?.argument?.keyMoments || []),
                ...(debateData.phases.openingStatements?.conStatement?.argument?.keyMoments || [])
            ];

            const topQuotes = allArguments
                .filter((m: any) => m.type === 'zinger' || m.type === 'rhetorical_climax')
                .slice(0, 3)
                .map((m: any) => ({
                    text: m.text,
                    agent: "Agent", // Would need to track this better
                    context: "Opening statement"
                }));

            // Create shareable cards
            const shareableCards = [
                {
                    type: 'winner_card',
                    content: {
                        winner: synthesis.winner.who,
                        score: `${finalScore.pro} - ${finalScore.con}`,
                        defining_moment: synthesis.winner.defining_moment
                    }
                },
                {
                    type: 'best_argument',
                    content: {
                        side: 'Pro',
                        argument: synthesis.bestArguments.pro.argument,
                        quote: synthesis.bestArguments.pro.quote
                    }
                },
                {
                    type: 'best_argument',
                    content: {
                        side: 'Con',
                        argument: synthesis.bestArguments.con.argument,
                        quote: synthesis.bestArguments.con.quote
                    }
                }
            ];

            return {
                bestMoments,
                topQuotes,
                controversies: topControversies,
                shareableCards
            };
        });

        // Store synthesis and highlights
        await step.run("store-synthesis", async () => {
            enhancedDebateStore.setSynthesis(debateId, synthesis);
            enhancedDebateStore.setHighlights(debateId, highlights);

            enhancedDebateStore.updatePhase(debateId, 'synthesis', 'Complete', 1.0);
        });

        // Emit completion
        await step.run("emit-completion", async () => {
            await inngest.send({
                name: "synthesis/complete",
                data: { debateId }
            });

            console.log(`✅ Synthesis complete!`);
            console.log(`\n${'═'.repeat(60)}`);
            console.log(`NARRATIVE OPENING:`);
            console.log(`"${synthesis.narrative.opening}"`);
            console.log(`${'═'.repeat(60)}\n`);
        });

        return {
            synthesis,
            highlights
        };
    }
);
