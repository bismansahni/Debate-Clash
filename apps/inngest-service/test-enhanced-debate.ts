/**
 * Test script for Enhanced Debate System
 * Run with: npx tsx test-enhanced-debate.ts
 */

import { inngest } from "./src/inngest/client.ts";
import { enhancedDebateStore } from "./src/state/enhanced-debate-store.ts";

async function testEnhancedDebate() {
  console.log("\n🎭 Enhanced Debate System - Comprehensive Test");
  console.log("═".repeat(70));
  console.log("This will test all 11 phases of the enhanced debate flow");
  console.log(`${"═".repeat(70)}\n`);

  const topic = "Should AI research be regulated by international treaty?";

  try {
    // Trigger enhanced debate
    console.log(`📝 Debate Topic:`);
    console.log(`   "${topic}"\n`);
    console.log(`⏳ Triggering enhanced debate workflow...\n`);

    const result = await inngest.send({
      name: "debate/initiate-enhanced",
      data: { topic },
    });

    const debateId = `debate-${result.ids[0]}`;
    console.log(`✅ Debate triggered successfully!`);
    console.log(`   Debate ID: ${debateId}`);
    console.log(`   Event ID: ${result.ids[0]}\n`);

    // Poll for status updates
    console.log(`⏳ Monitoring debate progress (updates every 2 seconds)...`);
    console.log(`   Press Ctrl+C to stop\n`);
    console.log("─".repeat(70));

    let lastPhase = "";
    let phaseStartTime = Date.now();
    const totalStartTime = Date.now();

    const pollInterval = setInterval(() => {
      const debate = enhancedDebateStore.get(debateId);

      if (debate) {
        const currentPhase = debate.currentPhase;
        const phaseStr = `${currentPhase.type}${currentPhase.subPhase ? ` - ${currentPhase.subPhase}` : ""}`;

        if (phaseStr !== lastPhase) {
          const phaseDuration = ((Date.now() - phaseStartTime) / 1000).toFixed(1);

          if (lastPhase) {
            console.log(`   ⏱️  Duration: ${phaseDuration}s\n`);
          }

          console.log(`\n📍 PHASE: ${phaseStr.toUpperCase()}`);
          console.log(`   Progress: ${Math.round(currentPhase.progress * 100)}%`);

          lastPhase = phaseStr;
          phaseStartTime = Date.now();

          // Show phase-specific info
          showPhaseDetails(debate, currentPhase.type);
        }

        // Check if complete
        if (debate.status === "completed") {
          clearInterval(pollInterval);
          const totalDuration = ((Date.now() - totalStartTime) / 1000).toFixed(1);
          console.log(`\n${"═".repeat(70)}`);
          console.log(`✅ DEBATE COMPLETE! Total time: ${totalDuration}s`);
          console.log("═".repeat(70));
          showResults(debate);
        }
      } else {
        console.log(`⏳ Waiting for debate to start...`);
      }
    }, 2000);

    // Timeout after 10 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
      console.log("\n⏱️  Test timeout reached (10 minutes). Checking final status...\n");
      const debate = enhancedDebateStore.get(debateId);
      if (debate) {
        console.log(`Current status: ${debate.status}`);
        console.log(`Current phase: ${debate.currentPhase.type}`);
        showResults(debate);
      } else {
        console.log("❌ No debate data found. Check Inngest logs.");
      }
      process.exit(0);
    }, 600000);
  } catch (error) {
    console.error("\n❌ Error triggering debate:");
    console.error(error);
    process.exit(1);
  }
}

function showPhaseDetails(debate: any, phase: string) {
  // Show relevant details for each phase
  switch (phase) {
    case "pre-show":
      if (debate.preShow) {
        console.log(`   📊 Odds: Pro ${debate.preShow.odds?.pro}% - Con ${debate.preShow.odds?.con}%`);
      }
      break;

    case "researching":
      if (debate.researchMontage?.liveUpdates) {
        const updates = debate.researchMontage.liveUpdates;
        if (updates.length > 0) {
          console.log(`   🔬 Latest: "${updates[updates.length - 1]}"`);
        }
      }
      break;

    case "opening-statements":
      if (debate.phases.openingStatements) {
        const opening = debate.phases.openingStatements;
        if (opening.proStatement) {
          console.log(`   ✅ Pro opening complete`);
        }
        if (opening.conStatement) {
          console.log(`   ✅ Con opening complete`);
        }
      }
      break;

    case "cross-examination":
      if (debate.phases.crossExamination) {
        const crossExam = debate.phases.crossExamination;
        if (crossExam.round1?.analysis) {
          console.log(`   ⚔️  Round 1 winner: ${crossExam.round1.analysis.winner}`);
        }
        if (crossExam.round2?.analysis) {
          console.log(`   ⚔️  Round 2 winner: ${crossExam.round2.analysis.winner}`);
        }
      }
      break;

    case "deliberation":
      if (debate.phases.deliberation) {
        const delib = debate.phases.deliberation;
        const judges = ["logicJudge", "evidenceJudge", "rhetoricJudge"];
        judges.forEach((judge) => {
          if (delib[judge]) {
            console.log(`   🤔 ${delib[judge].judge_name} is thinking...`);
          }
        });
      }
      break;

    case "verdict":
      if (debate.phases.verdict?.finalScore) {
        const score = debate.phases.verdict.finalScore;
        console.log(`   🏆 Winner: ${score.winner} (${score.margin} point margin)`);
      }
      break;
  }

  // Show momentum
  if (debate.momentum && debate.momentum.history.length > 0) {
    const latest = debate.momentum.history[debate.momentum.history.length - 1];
    console.log(`   📊 Momentum: ${latest.description}`);
  }

  // Show latest controversy
  if (debate.controversyMoments && debate.controversyMoments.length > 0) {
    const latest = debate.controversyMoments[debate.controversyMoments.length - 1];
    console.log(`   🔥 ${latest.type}: "${latest.clip.substring(0, 50)}..."`);
  }

  // Show live fact-checks
  if (debate.liveFactChecks && debate.liveFactChecks.length > 0) {
    const latest = debate.liveFactChecks[debate.liveFactChecks.length - 1];
    console.log(`   ✓ Fact-check: ${latest.verdict.toUpperCase()} - "${latest.claim.substring(0, 40)}..."`);
  }
}

function showResults(debate: any) {
  console.log(`\n\n${"═".repeat(70)}`);
  console.log("🎭 ENHANCED DEBATE RESULTS");
  console.log("═".repeat(70));

  // Agents
  if (debate.agents && debate.agents.length > 0) {
    console.log(`\n👥 DEBATERS:`);
    debate.agents.forEach((agent: any) => {
      console.log(`   • ${agent.persona.name} (${agent.stance})`);
      console.log(`     Background: ${agent.persona.background.substring(0, 60)}...`);
    });
  }

  // Pre-show predictions
  if (debate.preShow) {
    console.log(`\n🎬 PRE-SHOW PREDICTIONS:`);
    console.log(`   Predicted odds: Pro ${debate.preShow.odds?.pro}% - Con ${debate.preShow.odds?.con}%`);
    if (debate.preShow.predictions) {
      console.log(`   Prediction: "${debate.preShow.predictions.substring(0, 80)}..."`);
    }
  }

  // Judge scores
  if (debate.phases.verdict) {
    console.log(`\n⚖️  JUDGE SCORES:`);
    const verdict = debate.phases.verdict;

    ["logicScore", "evidenceScore", "rhetoricScore"].forEach((scoreType: string) => {
      if (verdict[scoreType]) {
        const judge = verdict[scoreType];
        console.log(`\n   ${judge.judgeName}:`);
        console.log(`   ├─ Pro: ${judge.scores.pro}/10`);
        console.log(`   ├─ Con: ${judge.scores.con}/10`);
        console.log(`   └─ "${judge.commentary.verdict.substring(0, 70)}..."`);
      }
    });

    if (verdict.finalScore) {
      const score = verdict.finalScore;
      console.log(`\n   📊 TOTAL SCORES:`);
      console.log(`   ├─ Pro: ${score.pro}/30`);
      console.log(`   ├─ Con: ${score.con}/30`);
      console.log(`   └─ Winner: ${score.winner} by ${score.margin} points`);
    }
  }

  // Synthesis
  if (debate.synthesis) {
    console.log(`\n📖 NARRATIVE SYNTHESIS:`);
    console.log(`\n   Opening:`);
    console.log(`   "${debate.synthesis.narrative.opening}"`);

    console.log(`\n   Winner Analysis:`);
    console.log(`   • Who: ${debate.synthesis.winner.who}`);
    console.log(`   • Why: "${debate.synthesis.winner.why.substring(0, 100)}..."`);
    console.log(`   • Defining moment: "${debate.synthesis.winner.defining_moment.substring(0, 80)}..."`);

    if (debate.synthesis.narrative.themes) {
      console.log(`\n   Themes:`);
      debate.synthesis.narrative.themes.forEach((theme: string) => {
        console.log(`   • ${theme}`);
      });
    }
  }

  // Controversy moments
  if (debate.controversyMoments && debate.controversyMoments.length > 0) {
    console.log(`\n🔥 TOP CONTROVERSY MOMENTS (${debate.controversyMoments.length} total):`);
    debate.controversyMoments.slice(0, 5).forEach((moment: any, i: number) => {
      console.log(`\n   ${i + 1}. [${moment.type.toUpperCase()}] ${moment.agent} (${moment.impact} impact)`);
      console.log(`      "${moment.clip.substring(0, 100)}..."`);
    });
  }

  // Momentum tracking
  if (debate.momentum) {
    console.log(`\n📊 FINAL MOMENTUM:`);
    console.log(`   Leader: ${debate.momentum.currentLeader.toUpperCase()}`);
    console.log(`   Scores: Pro ${debate.momentum.currentScore.pro} - Con ${debate.momentum.currentScore.con}`);
    console.log(`   Volatility: ${debate.momentum.volatility}`);
    console.log(`   Total shifts: ${debate.momentum.history.length}`);
  }

  // Live fact-checks
  if (debate.liveFactChecks && debate.liveFactChecks.length > 0) {
    console.log(`\n✓ FACT-CHECKS (${debate.liveFactChecks.length} total):`);
    const verified = debate.liveFactChecks.filter((fc: any) => fc.verdict === "verified").length;
    const disputed = debate.liveFactChecks.filter((fc: any) => fc.verdict === "disputed").length;
    console.log(`   Verified: ${verified} | Disputed: ${disputed}`);
  }

  // Highlights
  if (debate.highlights) {
    console.log(`\n✨ SHAREABLE CONTENT:`);
    console.log(`   • Best moments: ${debate.highlights.bestMoments?.length || 0}`);
    console.log(`   • Top quotes: ${debate.highlights.topQuotes?.length || 0}`);
    console.log(`   • Shareable cards: ${debate.highlights.shareableCards?.length || 0}`);
  }

  // Phase completion
  console.log(`\n📍 PHASES COMPLETED:`);
  const completedPhases = [];
  if (debate.preShow) completedPhases.push("✓ Pre-Show");
  if (debate.researchMontage?.status === "complete") completedPhases.push("✓ Research");
  if (debate.phases.openingStatements) completedPhases.push("✓ Opening Statements");
  if (debate.phases.crossExamination) completedPhases.push("✓ Cross-Examination");
  if (debate.phases.rebuttals) completedPhases.push("✓ Rebuttals");
  if (debate.phases.audienceQuestions) completedPhases.push("✓ Audience Questions");
  if (debate.phases.lightningRound) completedPhases.push("✓ Lightning Round");
  if (debate.phases.closingStatements) completedPhases.push("✓ Closing Statements");
  if (debate.phases.deliberation) completedPhases.push("✓ Deliberation");
  if (debate.phases.verdict) completedPhases.push("✓ Verdict");
  if (debate.synthesis) completedPhases.push("✓ Synthesis");

  completedPhases.forEach((phase) => console.log(`   ${phase}`));

  console.log(`\n${"═".repeat(70)}`);
  console.log("✅ TEST COMPLETE!");
  console.log("═".repeat(70));
  console.log(`\nDebate ID: ${debate.debateId}`);
  console.log(`Full data available at: enhancedDebateStore.get("${debate.debateId}")`);
  console.log(`\n💡 TIP: Check Inngest Dev UI at http://localhost:8288 for execution details\n`);

  process.exit(0);
}

// Run test
testEnhancedDebate();
