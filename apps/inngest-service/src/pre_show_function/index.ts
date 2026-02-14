import { inngest } from "../inngest/client.ts";
import { generateText, Output } from "ai";
import { gateway } from "../ai-gateway/client.ts";
import { PreShowSchema } from "../schemas/enhanced-types.ts";
import { enhancedDebateStore } from "../state/enhanced-debate-store.ts";

/**
 * Pre-Show Content Generator
 * Creates anticipation by explaining why the debate matters and predicting outcomes
 */
export const preShowFunction = inngest.createFunction(
    { id: "pre-show-generator" },
    { event: "pre-show/generate" },
    async ({ event, step }) => {
        const { debateId, topic, analysis, agents } = event.data;

        console.log(`🎬 Generating pre-show content for: "${topic}"`);

        // Generate pre-show content
        const preShow = await step.run("generate-pre-show", async () => {
            const result = await generateText({
                model: gateway("google/gemini-3-flash"),
                output: Output.object({
                    schema: PreShowSchema
                }),
                prompt: `You are introducing an AI debate to an audience. Make them excited and curious!

DEBATE TOPIC: "${topic}"

AGENTS:
${agents.map((a: any) => `- ${a.persona} (${a.stance})`).join('\n')}

DEBATE STRUCTURE: ${analysis.debateType}, ${analysis.rounds} rounds

Generate pre-show content:

1. CONTEXT (2-3 sentences):
   - Why does this topic matter RIGHT NOW?
   - What are the real-world stakes?
   - Who cares about this and why?

   Example: "AI regulation isn't an abstract policy debate—it's about who controls the most transformative technology in history. Billions of dollars and potentially humanity's future hang in the balance."

2. STAKES (2-3 sentences):
   - What happens if Pro wins this argument?
   - What happens if Con wins?
   - Make the consequences feel real

   Example: "If regulation wins, we might save ourselves from catastrophe—or stifle the innovation that could solve our biggest problems. If innovation wins, we might unleash unprecedented progress—or Pandora's box."

3. PREDICTIONS (2-3 sentences):
   - Based on the agents' stances, what clash points do you foresee?
   - What will be the key battle?
   - Make a prediction (can be wrong—adds drama!)

   Example: "Expect Chen to lean heavily on historical precedent—watch Kumar counter with innovation velocity. The NPT treaty will come up. The winner? Slight edge to Chen on this topic—but Kumar could surprise us."

4. ODDS (Pro vs Con):
   - Give percentage odds based on topic strength
   - Should add up to 100
   - Example: Pro: 55, Con: 45

Keep it ENGAGING, not academic. Write like you're hyping up a championship bout.`
            });

            console.log("✅ Pre-show content generated:", result.output);

            // Store in debate state
            enhancedDebateStore.setPreShow(debateId, result.output);
            enhancedDebateStore.updatePhase(debateId, 'pre-show', 'Complete', 1.0);

            return result.output;
        });

        // Emit completion event
        await step.run("emit-completion", async () => {
            await inngest.send({
                name: "pre-show/complete",
                data: {
                    debateId
                }
            });
            console.log("✅ Pre-show complete event sent");
        });

        return preShow;
    }
);
