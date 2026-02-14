import { generateText } from "ai";
import { gateway } from "../ai-gateway/client.ts";
import { JUDGE_PERSONAS } from "../config/judge-personas.ts";
import { inngest } from "../inngest/client.ts";
import { enhancedDebateStore } from "../state/enhanced-debate-store.ts";

/**
 * Judge Deliberation Phase
 * Visible thinking process - builds suspense before scores revealed
 */
export const enhancedJudgeDeliberationFunction = inngest.createFunction(
  { id: "enhanced-judge-deliberation" },
  { event: "judges/deliberate" },
  async ({ event, step }) => {
    const { debateId, debateData } = event.data;

    console.log(`⚖️  JUDGE DELIBERATION: Visible thinking process`);

    enhancedDebateStore.updatePhase(debateId, "deliberation", "In Progress", 0);

    const judgeTypes = ["logic", "evidence", "rhetoric"] as const;

    // Deliberate in sequence (visible to user)
    for (const judgeType of judgeTypes) {
      const persona = JUDGE_PERSONAS[judgeType];

      await step.run(`deliberate-${judgeType}`, async () => {
        console.log(`\n🤔 ${persona.name} is deliberating...`);

        // Generate visible thought process
        const deliberation = await generateText({
          model: gateway("google/gemini-3-flash"),
          prompt: `You are ${persona.name}, ${persona.personality}.

DEBATE TO JUDGE:
${JSON.stringify(debateData, null, 2)}

Your task: DELIBERATE before scoring. Show your THINKING PROCESS.

Generate your internal deliberation as a judge:

1. THOUGHT PROCESS (5-7 steps):
   Write your thoughts as you review the debate:
   - "Reviewing Pro's opening argument..."
   - "Interesting use of historical parallels..."
   - "Con's cross-exam evasion on question 2 was notable..."
   - "That closing rhetorical question from Pro landed well..."
   - "Weighing the evidence quality..."

   Write like you're thinking out loud. Be specific about what you're noticing.

2. INITIAL IMPRESSIONS:
   - Pro impression (1 sentence): First thoughts on Pro's performance
   - Con impression (1 sentence): First thoughts on Con's performance

3. DECIDING FACTORS (3-5 items):
   What specific moments or patterns will determine your scores?
   - "Pro's NPT example was well-deployed but repeated"
   - "Con's economic data was compelling"
   - "The lightning round concession from Pro"

Be authentic to your judging persona:
${judgeType === "logic" ? "- You care about logical structure, fallacies, reasoning quality" : ""}
${judgeType === "evidence" ? "- You care about data quality, source credibility, empirical support" : ""}
${judgeType === "rhetoric" ? "- You care about persuasive power, emotional connection, language artistry" : ""}

Write in your voice:
${persona.voice}

Keep it conversational but professional. This is your thinking, not your final judgment yet.

Return as plain text, with your thought process as a list of observations.`,
        });

        const thoughtProcess = deliberation.text.split("\n").filter((line) => line.trim());

        // Store deliberation
        enhancedDebateStore.setJudgeDeliberation(debateId, `${judgeType}Judge` as any, {
          judge_name: persona.name,
          judge_type: judgeType,
          thought_process: thoughtProcess,
          internal_notes: {
            pro_impression: "Initial analysis pending full review",
            con_impression: "Initial analysis pending full review",
            deciding_factors: ["Reviewing key arguments", "Assessing evidence", "Evaluating rhetoric"],
          },
        });

        console.log(`✅ ${persona.name} deliberation complete`);
        console.log(`   Thoughts: ${thoughtProcess.length} observations`);

        // Update progress
        const progress = (judgeTypes.indexOf(judgeType) + 1) / judgeTypes.length;
        enhancedDebateStore.updatePhase(debateId, "deliberation", `${persona.name}`, progress);

        // Pause for dramatic effect (simulate real thinking time)
        await new Promise((resolve) => setTimeout(resolve, 1000));
      });
    }

    // Emit completion
    await step.run("emit-completion", async () => {
      await inngest.send({
        name: "judges/deliberation-complete",
        data: { debateId },
      });

      console.log(`✅ All judges have deliberated! Moving to scoring...`);
    });

    return {
      message: "Judge deliberation complete",
      judges: judgeTypes.map((type) => JUDGE_PERSONAS[type].name),
    };
  },
);
