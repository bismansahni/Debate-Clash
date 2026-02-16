import { generateText, Output } from "ai";
import { gateway } from "../ai-gateway/client.ts";
import { JUDGE_PERSONAS } from "../config/judge-personas.ts";
import { inngest } from "../inngest/client.ts";
import { QuickJudgmentSchema } from "../schemas/enhanced-types.ts";
import { enhancedDebateStore } from "../state/enhanced-debate-store.ts";

/**
 * Judge Verdict Phase
 * Score each side 0-10. ONE sentence verdict per judge. That's it.
 * All 3 judges run in parallel.
 */
export const enhancedJudgeVerdictFunction = inngest.createFunction(
  { id: "enhanced-judge-verdict" },
  { event: "judges/score" },
  async ({ event, step, publish }) => {
    const { debateId, debateData } = event.data;

    console.log(`🏆 JUDGE VERDICT: Parallel scoring`);

    enhancedDebateStore.updatePhase(debateId, "verdict", "Revealing Scores", 0);

    const judgeTypes = ["logic", "evidence", "rhetoric"] as const;

    const proAgent = debateData.agents.find((a: any) => a.side === "pro")?.persona.name || "Pro";
    const conAgent = debateData.agents.find((a: any) => a.side === "con")?.persona.name || "Con";

    // Run all 3 judges in parallel
    const allVerdicts = await Promise.all(
      judgeTypes.map((judgeType) =>
        step.run(`score-reveal-${judgeType}`, async () => {
          const persona = JUDGE_PERSONAS[judgeType];

          console.log(`\n🎯 ${persona.name} scoring...`);

          const verdict = await generateText({
            model: gateway("google/gemini-3-flash"),
            output: Output.object({
              schema: QuickJudgmentSchema,
            }),
            prompt: `${persona.systemPrompt}

DEBATE SUMMARY:
Topic: ${debateData.topic}
Pro (${proAgent}): ${JSON.stringify(debateData.phases?.openingStatements?.proStatement)}
Con (${conAgent}): ${JSON.stringify(debateData.phases?.openingStatements?.conStatement)}
Rebuttals: ${JSON.stringify(debateData.phases?.rebuttals)}
Cross-exam: ${JSON.stringify(debateData.phases?.crossExamination)}

Score each side 0-10. Then ONE sentence verdict in your voice. That's it.

Your judgeName is "${persona.name}".
Your persona description is "${persona.voice}".

SCORING (0-10 for each side):
- 0-3: Poor
- 4-6: Adequate
- 7-8: Good
- 9-10: Excellent

Be decisive. Pick a winner with your verdict line.`,
          });

          const judgment = verdict.output;

          // Store verdict
          enhancedDebateStore.setJudgeVerdict(debateId, `${judgeType}Score` as any, judgment);

          console.log(`✅ ${persona.name}: Pro ${judgment.scores.pro}/10, Con ${judgment.scores.con}/10`);
          console.log(`   Verdict: "${judgment.verdict}"`);

          // Publish individual judge score
          await publish({
            channel: `debate:${debateId}`,
            topic: "updates",
            data: { type: "verdict-judge", judgeType, data: judgment },
          });

          return {
            judge: persona.name,
            type: judgeType,
            proScore: judgment.scores.pro,
            conScore: judgment.scores.con,
          };
        }),
      ),
    );

    // Calculate final scores
    const finalScore = await step.run("calculate-final-score", async () => {
      const proTotal = allVerdicts.reduce((sum, v) => sum + v.proScore, 0);
      const conTotal = allVerdicts.reduce((sum, v) => sum + v.conScore, 0);

      const winner = proTotal > conTotal ? proAgent : conAgent;
      const margin = Math.abs(proTotal - conTotal);

      console.log(`\nFINAL: ${proAgent} ${proTotal}/30 vs ${conAgent} ${conTotal}/30 -- Winner: ${winner}`);

      const finalScore = { pro: proTotal, con: conTotal, winner, margin };
      enhancedDebateStore.setFinalScore(debateId, finalScore);
      enhancedDebateStore.updatePhase(debateId, "verdict", "Scores revealed", 1.0);

      // Publish final score
      await publish({
        channel: `debate:${debateId}`,
        topic: "updates",
        data: { type: "verdict-final", data: finalScore },
      });

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
