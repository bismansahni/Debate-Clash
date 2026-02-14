import { generateText, Output } from "ai";
import { gateway } from "../ai-gateway/client.ts";
import { JUDGE_PERSONAS } from "../config/judge-personas.ts";
import { inngest } from "../inngest/client.ts";
import { EnhancedJudgmentSchema } from "../schemas/enhanced-types.ts";
import { enhancedDebateStore } from "../state/enhanced-debate-store.ts";

/**
 * Enhanced Judge Verdict Phase
 * Staggered score reveals with rich commentary in each judge's voice
 */
export const enhancedJudgeVerdictFunction = inngest.createFunction(
  { id: "enhanced-judge-verdict" },
  { event: "judges/score" },
  async ({ event, step }) => {
    const { debateId, debateData } = event.data;

    console.log(`🏆 JUDGE VERDICT: Staggered score reveals`);

    enhancedDebateStore.updatePhase(debateId, "verdict", "Revealing Scores", 0);

    const judgeTypes = ["logic", "evidence", "rhetoric"] as const;
    const allVerdicts: any[] = [];

    // Identify Pro and Con agents
    const proAgent = debateData.agents.find((a: any) => a.side === "pro")?.persona.name || "Pro";
    const conAgent = debateData.agents.find((a: any) => a.side === "con")?.persona.name || "Con";

    // Reveal scores one judge at a time (SUSPENSE!)
    for (let i = 0; i < judgeTypes.length; i++) {
      const judgeType = judgeTypes[i]!; // Safe: i is always within bounds
      const persona = JUDGE_PERSONAS[judgeType];

      await step.run(`score-reveal-${judgeType}`, async () => {
        console.log(`\n🎯 ${persona.name} revealing scores...`);

        const verdict = await generateText({
          model: gateway("google/gemini-3-flash"),
          output: Output.object({
            schema: EnhancedJudgmentSchema,
          }),
          prompt: `${persona.systemPrompt}

ENTIRE DEBATE TO JUDGE:
${JSON.stringify(debateData, null, 2)}

Your deliberation notes:
${JSON.stringify(enhancedDebateStore.get(debateId)?.phases.deliberation?.[`${judgeType}Judge`], null, 2)}

Now provide your FINAL JUDGMENT with scores and detailed commentary.

SCORING (0-10 for each side):
- 0-3: Poor (major flaws, unconvincing)
- 4-6: Adequate (decent but significant weaknesses)
- 7-8: Good (strong performance, minor issues)
- 9-10: Excellent (exceptional, compelling)

Be honest and specific. Your scores should reflect real differences in quality.

PROVIDE:

1. OVERALL COMMENTARY (2-3 sentences in YOUR voice):
   Summary of the debate from your judging perspective
   Example: "Well, well. We've got substance here, but style varied wildly..."

2. PRO ANALYSIS (${proAgent}):
   - Strengths (3-5 specific items with quotes)
   - Weaknesses (2-3 specific items)
   - Standout moment (best moment - quote it)
   - Score reasoning (why this score, in your voice)
   - Score (0-10)

3. CON ANALYSIS (${conAgent}):
   - Strengths (3-5 specific items with quotes)
   - Weaknesses (2-3 specific items)
   - Standout moment (best moment - quote it)
   - Score reasoning (why this score, in your voice)
   - Score (0-10)

4. VERDICT (1 sentence, memorable, in your voice):
   Final thought on who won YOUR specific criterion
   Example: "Give me truth wrapped in beauty. Chen did. Kumar gave me truth wrapped in bullet points."

Remember your voice:
${persona.voice}

Be specific, quotable, and authentic to your judging philosophy.`,
        });

        const judgment = verdict.output;

        // Store verdict
        enhancedDebateStore.setJudgeVerdict(debateId, `${judgeType}Score` as any, judgment);

        allVerdicts.push({
          judge: persona.name,
          type: judgeType,
          proScore: judgment.scores.pro,
          conScore: judgment.scores.con,
        });

        console.log(`✅ ${persona.name} scores:`);
        console.log(`   Pro (${proAgent}): ${judgment.scores.pro}/10`);
        console.log(`   Con (${conAgent}): ${judgment.scores.con}/10`);
        console.log(`   Verdict: "${judgment.commentary.verdict}"`);

        // Update progress
        const progress = (i + 1) / judgeTypes.length;
        enhancedDebateStore.updatePhase(debateId, "verdict", `${persona.name} scores revealed`, progress);

        // Pause between judge reveals (SUSPENSE)
        if (i < judgeTypes.length - 1) {
          console.log(`\n   [Pausing for dramatic effect...]\n`);
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      });
    }

    // Calculate final scores
    const finalScore = await step.run("calculate-final-score", async () => {
      const proTotal = allVerdicts.reduce((sum, v) => sum + v.proScore, 0);
      const conTotal = allVerdicts.reduce((sum, v) => sum + v.conScore, 0);

      const winner = proTotal > conTotal ? proAgent : conAgent;
      const margin = Math.abs(proTotal - conTotal);

      console.log(`\n${"═".repeat(60)}`);
      console.log(`FINAL SCORE:`);
      console.log(`${proAgent}: ${proTotal}/30`);
      console.log(`${conAgent}: ${conTotal}/30`);
      console.log(`WINNER: ${winner} (margin: ${margin} points)`);
      console.log(`${"═".repeat(60)}\n`);

      const finalScore = {
        pro: proTotal,
        con: conTotal,
        winner,
        margin,
      };

      enhancedDebateStore.setFinalScore(debateId, finalScore);

      return finalScore;
    });

    // Emit completion
    await step.run("emit-completion", async () => {
      await inngest.send({
        name: "judges/verdict-complete",
        data: {
          debateId,
          winner: finalScore.winner,
          finalScore,
        },
      });

      console.log(`✅ Verdict complete! Winner: ${finalScore.winner}`);
    });

    return {
      verdicts: allVerdicts,
      finalScore,
    };
  },
);
