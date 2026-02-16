import { closingStatementsFunction } from "../closing_statements_function/index.ts";
import { crossExaminationFunction } from "../cross_exam_function/index.ts";
import { enhancedJudgeVerdictFunction } from "../enhanced_judge_verdict_function/index.ts";
// Enhanced debate system functions
import { enhancedOrchestrator } from "../enhanced_orchestrator_function/index.ts";
import { lightningRoundFunction } from "../lightning_round_function/index.ts";
import { openingStatementsFunction } from "../opening_statements_function/index.ts";
import { rebuttalsFunction } from "../rebuttals_function/index.ts";
import { inngest } from "./client.ts";

// Re-export the client
export { inngest };

// Export all debate functions
export const functions = [
  // Orchestration
  enhancedOrchestrator,

  // Debate phases
  openingStatementsFunction,
  crossExaminationFunction,
  rebuttalsFunction,
  lightningRoundFunction,
  closingStatementsFunction,

  // Judging
  enhancedJudgeVerdictFunction,
];
