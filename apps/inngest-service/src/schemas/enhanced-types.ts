import { z } from "zod";

// ===========================
// DEBATE ANALYSIS
// ===========================

/**
 * Schema for analyzing debate topic structure
 * Used by: Enhanced Orchestrator
 */
export const DebateAnalysisSchema = z.object({
    debateType: z.enum(["binary", "multi-perspective", "comparison"]),
    positions: z.array(z.object({
        role: z.string(),
        stance: z.string(),
        persona: z.string()
    })),
    rounds: z.number().min(2).max(4),
    complexity: z.enum(["simple", "medium", "complex"]),
    needsResearch: z.boolean()
});

export type DebateAnalysis = z.infer<typeof DebateAnalysisSchema>;

// ===========================
// ENHANCED ARGUMENT SCHEMA (Human-Centered)
// ===========================

export const ArgumentPointSchema = z.object({
    claim: z.string().describe("The main assertion"),
    elaboration: z.string().describe("The explanation with personality"),
    rhetorical_device: z.string().optional().describe("metaphor, analogy, rhetorical question, etc."),
    emotional_tone: z.string().describe("passionate, measured, urgent, skeptical, etc."),
    supporting_evidence_ids: z.array(z.string()).optional()
});

export const EnhancedEvidenceSchema = z.object({
    claim: z.string(),
    source: z.string(),
    year: z.number().optional(),
    presentation: z.object({
        framing: z.string().describe("How to present this dramatically"),
        emphasis: z.enum(["statistical", "narrative", "comparative"])
    }),
    credibility_signal: z.string().optional().describe("From the UN's own report")
});

export const KeyMomentSchema = z.object({
    text: z.string(),
    type: z.enum(["zinger", "rhetorical_climax", "emotional_peak", "concession", "direct_hit"]),
    timestamp: z.number().min(0).max(1).describe("0-1, position in argument"),
    impact_level: z.enum(["1", "2", "3"]).transform(val => parseInt(val))
});

export const EnhancedArgumentSchema = z.object({
    // Opening hook
    opening: z.object({
        text: z.string(),
        hook_type: z.enum(["emotional", "question", "statistic", "anecdote", "provocative"])
    }),

    // Main points with personality
    mainPoints: z.array(ArgumentPointSchema),

    // Direct engagement with opponent
    directEngagement: z.object({
        opponentQuote: z.string().optional(),
        response: z.string(),
        tone: z.enum(["aggressive", "dismissive", "respectful", "sarcastic", "collaborative"])
    }),

    // Personal element
    personalElement: z.object({
        type: z.enum(["anecdote", "professional_experience", "personal_stake"]),
        text: z.string()
    }).optional(),

    // Enhanced evidence
    evidence: z.array(EnhancedEvidenceSchema),

    // Conclusion with rhetorical power
    conclusion: z.object({
        text: z.string(),
        rhetorical_device: z.enum(["question", "call_to_action", "reframe", "callback"]).optional(),
        callback_to: z.string().optional()
    }),

    // Key moments for UI highlighting
    keyMoments: z.array(KeyMomentSchema),

    // Emotional arc
    emotional_journey: z.object({
        start: z.enum(["calm", "urgent", "passionate", "measured"]),
        peak: z.enum(["calm", "urgent", "passionate", "measured"]),
        end: z.enum(["calm", "urgent", "passionate", "measured"])
    })
});

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
        weaknesses: z.string().optional()
    }),

    motivation: z.string(),

    debate_style: z.object({
        opening_move: z.string(),
        argumentation: z.string(),
        engagement_with_opponent: z.string(),
        closing_move: z.string()
    })
});

// ===========================
// MOMENTUM TRACKING
// ===========================

export const MomentumEventSchema = z.object({
    timestamp: z.number(),
    phase: z.string(),
    trigger: z.string(),
    shift: z.number(),
    description: z.string()
});

export const MomentumStateSchema = z.object({
    currentScore: z.object({
        pro: z.number(),
        con: z.number()
    }),
    history: z.array(MomentumEventSchema),
    currentLeader: z.enum(["pro", "con", "tied"]),
    volatility: z.enum(["stable", "shifting", "dramatic"])
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
    clip: z.string()
});

// ===========================
// CROSS-EXAMINATION SCHEMA
// ===========================

export const CrossExamQuestionSchema = z.object({
    question: z.string(),
    intent: z.enum(["expose_weakness", "force_concession", "clarify_position", "trap"]),
    target_weakness: z.string()
});

export const CrossExamAnswerSchema = z.object({
    question: z.string(),
    answer: z.string(),
    strategy: z.enum(["direct_answer", "deflection", "counter_attack", "concession"]),
    evasion: z.boolean()
});

export const CrossExamAnalysisSchema = z.object({
    directness_score: z.number().min(0).max(10),
    concessions_made: z.array(z.string()),
    counter_attacks: z.array(z.string()),
    evasions: z.array(z.string()),
    winner: z.enum(["questioner", "respondent", "tie"]),
    key_exchange: z.string()
});

// ===========================
// AUDIENCE QUESTIONS
// ===========================

export const AudiencePersonaSchema = z.object({
    name: z.string(),
    perspective: z.string(),
    bias: z.string(),
    question_style: z.string()
});

export const AudienceQuestionSchema = z.object({
    persona: AudiencePersonaSchema,
    question: z.string(),
    challenges: z.enum(["pro", "con", "both"]),
    forces_specificity: z.boolean()
});

// ===========================
// LIGHTNING ROUND
// ===========================

export const LightningQuestionSchema = z.object({
    question: z.string(),
    time_limit_seconds: z.number(),
    forces_position: z.boolean()
});

export const LightningAnswerSchema = z.object({
    question: z.string(),
    answer: z.string(),
    word_count: z.number(),
    concession_made: z.boolean()
});

// ===========================
// ENHANCED MODERATOR (Commentary Style)
// ===========================

export const EnhancedModeratorSchema = z.object({
    moderatorPersona: z.string(),

    commentary: z.object({
        opening: z.string(),

        roundAssessment: z.object({
            text: z.string(),
            tone: z.string()
        }),

        standoutMoments: z.array(z.object({
            agent: z.string(),
            moment: z.string(),
            impact: z.enum(["weak", "moderate", "strong", "very_strong"])
        })),

        narrative_tension: z.object({
            level: z.enum(["low", "medium", "high", "explosive"]),
            description: z.string()
        }),

        watchPoints: z.array(z.string()),

        logicalIssues: z.array(z.object({
            agent: z.string(),
            fallacy: z.string(),
            severity: z.enum(["minor", "moderate", "major"]),
            commentary: z.string()
        })),

        recommendation: z.object({
            continue: z.boolean(),
            reason: z.string(),
            nextRoundFocus: z.string().optional()
        })
    })
});

// ===========================
// JUDGE PERSONALITIES & DELIBERATION
// ===========================

export const JudgeDeliberationSchema = z.object({
    judge_name: z.string(),
    judge_type: z.enum(["logic", "evidence", "rhetoric"]),

    thought_process: z.array(z.string()),

    internal_notes: z.object({
        pro_impression: z.string(),
        con_impression: z.string(),
        deciding_factors: z.array(z.string())
    })
});

export const EnhancedJudgmentSchema = z.object({
    judgeName: z.string(),
    persona: z.string(),

    scores: z.object({
        pro: z.number().min(0).max(10),
        con: z.number().min(0).max(10)
    }),

    commentary: z.object({
        overall: z.string(),

        proAnalysis: z.object({
            strengths: z.array(z.string()),
            weaknesses: z.array(z.string()),
            standoutMoment: z.string().optional(),
            score_reasoning: z.string()
        }),

        conAnalysis: z.object({
            strengths: z.array(z.string()),
            weaknesses: z.array(z.string()),
            standoutMoment: z.string().optional(),
            score_reasoning: z.string()
        }),

        verdict: z.string()
    })
});

// ===========================
// ENHANCED SYNTHESIS (Storytelling)
// ===========================

export const EnhancedSynthesisSchema = z.object({
    narrative: z.object({
        opening: z.string(),
        act1_setup: z.string(),
        act2_conflict: z.string(),
        act3_resolution: z.string(),
        themes: z.array(z.string())
    }),

    bestArguments: z.object({
        pro: z.object({
            argument: z.string(),
            why_it_worked: z.string(),
            quote: z.string()
        }),
        con: z.object({
            argument: z.string(),
            why_it_worked: z.string(),
            quote: z.string()
        })
    }),

    openQuestions: z.array(z.string()),

    takeaways: z.object({
        if_you_agreed_with_pro: z.string(),
        if_you_agreed_with_con: z.string(),
        the_synthesis: z.string()
    }),

    winner: z.object({
        who: z.string(),
        margin: z.string(),
        why: z.string(),
        defining_moment: z.string()
    }),

    furtherExploration: z.array(z.string())
});

// ===========================
// PRE-SHOW CONTENT
// ===========================

export const PreShowSchema = z.object({
    context: z.string().describe("Why this topic matters"),
    stakes: z.string().describe("What's at risk"),
    predictions: z.string().describe("Moderator's pre-debate analysis"),
    odds: z.object({
        pro: z.number(),
        con: z.number()
    })
});

// ===========================
// LIVE FACT-CHECK
// ===========================

export const LiveFactCheckSchema = z.object({
    claim: z.string(),
    agent: z.string(),
    timestamp: z.number(),
    verdict: z.enum(["verified", "disputed", "misleading", "unverifiable"]),
    explanation: z.string(),
    source: z.string().optional(),
    impact: z.enum(["minor", "moderate", "major"])
});

// ===========================
// TYPE EXPORTS
// ===========================

export type ArgumentPoint = z.infer<typeof ArgumentPointSchema>;
export type EnhancedEvidence = z.infer<typeof EnhancedEvidenceSchema>;
export type KeyMoment = z.infer<typeof KeyMomentSchema>;
export type EnhancedArgument = z.infer<typeof EnhancedArgumentSchema>;
export type AgentPersona = z.infer<typeof AgentPersonaSchema>;
export type MomentumEvent = z.infer<typeof MomentumEventSchema>;
export type MomentumState = z.infer<typeof MomentumStateSchema>;
export type ControversyMoment = z.infer<typeof ControversyMomentSchema>;
export type CrossExamQuestion = z.infer<typeof CrossExamQuestionSchema>;
export type CrossExamAnswer = z.infer<typeof CrossExamAnswerSchema>;
export type CrossExamAnalysis = z.infer<typeof CrossExamAnalysisSchema>;
export type AudiencePersona = z.infer<typeof AudiencePersonaSchema>;
export type AudienceQuestion = z.infer<typeof AudienceQuestionSchema>;
export type LightningQuestion = z.infer<typeof LightningQuestionSchema>;
export type LightningAnswer = z.infer<typeof LightningAnswerSchema>;
export type EnhancedModerator = z.infer<typeof EnhancedModeratorSchema>;
export type JudgeDeliberation = z.infer<typeof JudgeDeliberationSchema>;
export type EnhancedJudgment = z.infer<typeof EnhancedJudgmentSchema>;
export type EnhancedSynthesis = z.infer<typeof EnhancedSynthesisSchema>;
export type PreShow = z.infer<typeof PreShowSchema>;
export type LiveFactCheck = z.infer<typeof LiveFactCheckSchema>;
