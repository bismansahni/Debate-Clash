import { inngest } from "./client.ts";

// Enhanced debate system functions
import { enhancedOrchestrator } from "../enhanced_orchestrator_function/index.ts";
import { preShowFunction } from "../pre_show_function/index.ts";
import { openingStatementsFunction } from "../opening_statements_function/index.ts";
import { crossExaminationFunction } from "../cross_exam_function/index.ts";
import { rebuttalsFunction } from "../rebuttals_function/index.ts";
import { audienceQuestionsFunction } from "../audience_questions_function/index.ts";
import { lightningRoundFunction } from "../lightning_round_function/index.ts";
import { closingStatementsFunction } from "../closing_statements_function/index.ts";
import { enhancedJudgeDeliberationFunction } from "../enhanced_judge_deliberation_function/index.ts";
import { enhancedJudgeVerdictFunction } from "../enhanced_judge_verdict_function/index.ts";
import { enhancedSynthesisFunction } from "../enhanced_synthesis_function/index.ts";

// Re-export the client
export { inngest };

// Export all debate functions
export const functions = [
    // Orchestration
    enhancedOrchestrator,           // Main flow coordinator
    preShowFunction,                // Pre-show content

    // Debate phases
    openingStatementsFunction,      // Opening statements with personality
    crossExaminationFunction,       // Q&A rounds
    rebuttalsFunction,              // Direct responses
    audienceQuestionsFunction,      // AI persona questions
    lightningRoundFunction,         // Rapid-fire
    closingStatementsFunction,      // Final pitch

    // Judging
    enhancedJudgeDeliberationFunction,  // Visible thinking
    enhancedJudgeVerdictFunction,       // Staggered reveals

    // Synthesis
    enhancedSynthesisFunction,      // Narrative storytelling
];
