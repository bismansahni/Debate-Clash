import { generateText } from "ai";
import { gateway } from "../ai-gateway/client.ts";
import { inngest } from "../inngest/client.ts";
import { enhancedDebateStore } from "../state/enhanced-debate-store.ts";

/**
 * Agent Research Function
 * Each agent researches the debate topic from their perspective,
 * gathering evidence and arguments to support their stance.
 */
export const researchFunction = inngest.createFunction(
  { id: "agent-research" },
  { event: "agent/research" },
  async ({ event, step }) => {
    const { debateId, topic, aspect, persona } = event.data;

    console.log(`🔬 [${persona}] Starting research on "${topic}" (${aspect})`);

    const findings = await step.run("generate-research", async () => {
      enhancedDebateStore.addResearchUpdate(debateId, `${persona} is researching ${aspect} arguments...`);

      const result = await generateText({
        model: gateway("google/gemini-3-flash"),
        prompt: `You are ${persona}, preparing to debate the topic: "${topic}"

Your assigned perspective: ${aspect}

Research this topic deeply from your perspective. Provide:

1. KEY ARGUMENTS (3-5 strong arguments supporting your position):
   - Each argument should have a clear claim, evidence/reasoning, and emotional hook
   - Use real-world examples, statistics, or case studies where possible

2. COUNTERARGUMENT PREPARATION (2-3 likely opposing arguments and your rebuttals):
   - Anticipate what the other side will say
   - Prepare sharp, memorable rebuttals

3. KILLER FACTS (2-3 devastating facts or statistics that support your case):
   - These should be conversation-stoppers
   - The kind of evidence that makes the audience gasp

4. RHETORICAL WEAPONS (2-3 memorable phrases, analogies, or rhetorical devices you'll use):
   - Sound bites that stick in people's minds
   - Vivid metaphors or analogies

Format your response as a structured research brief that ${persona} would use to prepare for the debate.
Keep it conversational and passionate — this is debate prep, not an academic paper.`,
      });

      const finding = {
        persona,
        aspect,
        content: result.text,
        timestamp: Date.now(),
      };

      enhancedDebateStore.addResearchUpdate(
        debateId,
        `${persona} completed research — found key arguments for ${aspect} position`,
        finding,
      );

      console.log(`✅ [${persona}] Research complete`);
      return finding;
    });

    // Emit completion event
    await step.run("emit-research-complete", async () => {
      await inngest.send({
        name: "agent/research-complete",
        data: {
          debateId,
          persona,
          findings,
        },
      });
      console.log(`✅ [${persona}] Research complete event sent`);
    });

    return findings;
  },
);
