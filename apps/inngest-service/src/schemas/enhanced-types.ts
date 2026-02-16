import { z } from "zod";

// ===========================
// DEBATE ANALYSIS
// ===========================

export const DebateAnalysisSchema = z.object({
  debateType: z.enum(["binary", "multi-perspective", "comparison"]),
  positions: z.array(
    z.object({
      role: z.string(),
      stance: z.string(),
      persona: z.string(),
    }),
  ),
  rounds: z.number().min(2).max(4),
  complexity: z.enum(["simple", "medium", "complex"]),
  needsResearch: z.boolean(),
});

export type DebateAnalysis = z.infer<typeof DebateAnalysisSchema>;

// ===========================
// PUNCHY STATEMENT (replaces EnhancedArgumentSchema)
// ===========================

export const PunchyStatementSchema = z.object({
  statement: z.string(),
  tone: z.string(),
});

export type PunchyStatement = z.infer<typeof PunchyStatementSchema>;

// ===========================
// AGENT PERSONA SCHEMA (Deep Personality)
// ===========================

export const AgentPersonaSchema = z.object({
  name: z.string(),
  age: z.number().optional(),
  background: z.string(),

  traits: z.object({
    speaking_style: z.string(),
    emotional_range: z.string(),
    rhetoric_preference: z.string(),
    tone: z.string(),
    catchphrases: z.array(z.string()).optional(),
    weaknesses: z.string().optional(),
  }),

  motivation: z.string(),

  debate_style: z.object({
    opening_move: z.string(),
    argumentation: z.string(),
    engagement_with_opponent: z.string(),
    closing_move: z.string(),
  }),
});

// ===========================
// MOMENTUM TRACKING
// ===========================

export const MomentumEventSchema = z.object({
  timestamp: z.number(),
  phase: z.string(),
  trigger: z.string(),
  shift: z.number(),
  description: z.string(),
});

export const MomentumStateSchema = z.object({
  currentScore: z.object({
    pro: z.number(),
    con: z.number(),
  }),
  history: z.array(MomentumEventSchema),
  currentLeader: z.enum(["pro", "con", "tied"]),
  volatility: z.enum(["stable", "shifting", "dramatic"]),
});

// ===========================
// CONTROVERSY DETECTION
// ===========================

export const ControversyMomentSchema = z.object({
  timestamp: z.number(),
  type: z.enum(["concession", "attack", "deflection", "zinger", "reversal"]),
  agent: z.string(),
  description: z.string(),
  impact: z.enum(["low", "medium", "high", "critical"]),
  clip: z.string(),
});

// ===========================
// KEY MOMENTS
// ===========================

export const KeyMomentSchema = z.object({
  text: z.string(),
  type: z.enum(["zinger", "rhetorical_climax", "emotional_peak", "concession", "direct_hit"]),
  timestamp: z.number().min(0).max(1).describe("0-1, position in argument"),
  impact_level: z.enum(["1", "2", "3"]).transform((val) => parseInt(val, 10)),
});

// ===========================
// CROSS-EXAMINATION SCHEMA
// ===========================

export const CrossExamQuestionSchema = z.object({
  question: z.string(),
  intent: z.enum(["expose_weakness", "force_concession", "clarify_position", "trap"]),
  target_weakness: z.string(),
});

export const CrossExamAnswerSchema = z.object({
  question: z.string(),
  answer: z.string(),
  strategy: z.enum(["direct_answer", "deflection", "counter_attack", "concession"]),
  evasion: z.boolean(),
});

export const CrossExamAnalysisSchema = z.object({
  directness_score: z.number().min(0).max(10),
  concessions_made: z.array(z.string()),
  counter_attacks: z.array(z.string()),
  evasions: z.array(z.string()),
  winner: z.enum(["questioner", "respondent", "tie"]),
  key_exchange: z.string(),
});

// ===========================
// LIGHTNING ROUND
// ===========================

export const LightningQuestionSchema = z.object({
  question: z.string(),
  time_limit_seconds: z.number(),
  forces_position: z.boolean(),
});

export const LightningAnswerSchema = z.object({
  question: z.string(),
  answer: z.string(),
  concession_made: z.boolean(),
});

// ===========================
// QUICK JUDGMENT (replaces EnhancedJudgmentSchema)
// ===========================

export const QuickJudgmentSchema = z.object({
  judgeName: z.string(),
  persona: z.string(),
  scores: z.object({
    pro: z.number().min(0).max(10),
    con: z.number().min(0).max(10),
  }),
  verdict: z.string(),
});

export type QuickJudgment = z.infer<typeof QuickJudgmentSchema>;

// ===========================
// TYPE EXPORTS
// ===========================

export type AgentPersona = z.infer<typeof AgentPersonaSchema>;
export type MomentumEvent = z.infer<typeof MomentumEventSchema>;
export type MomentumState = z.infer<typeof MomentumStateSchema>;
export type ControversyMoment = z.infer<typeof ControversyMomentSchema>;
export type KeyMoment = z.infer<typeof KeyMomentSchema>;
export type CrossExamQuestion = z.infer<typeof CrossExamQuestionSchema>;
export type CrossExamAnswer = z.infer<typeof CrossExamAnswerSchema>;
export type CrossExamAnalysis = z.infer<typeof CrossExamAnalysisSchema>;
export type LightningQuestion = z.infer<typeof LightningQuestionSchema>;
export type LightningAnswer = z.infer<typeof LightningAnswerSchema>;
