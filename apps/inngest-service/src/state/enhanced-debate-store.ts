/**
 * Enhanced in-memory debate state store
 * Supports all new phases: cross-exam, audience Q&A, lightning round, etc.
 */

import {
    MomentumState,
    ControversyMoment,
    LiveFactCheck,
    PreShow,
    JudgeDeliberation,
    EnhancedJudgment,
    EnhancedSynthesis
} from "../schemas/enhanced-types.ts";

// Phase types
export type DebatePhase =
    | 'preparing'
    | 'researching'
    | 'pre-show'
    | 'opening-statements'
    | 'cross-examination'
    | 'rebuttals'
    | 'audience-questions'
    | 'lightning-round'
    | 'closing-statements'
    | 'deliberation'
    | 'verdict'
    | 'synthesis'
    | 'completed'
    | 'error';

export interface CurrentPhase {
    type: DebatePhase;
    subPhase?: string;
    progress: number; // 0-1
}

export interface ResearchMontage {
    findings: any[];
    status: 'in_progress' | 'complete';
    liveUpdates: string[];
}

export interface OpeningPhase {
    proStatement?: any;
    conStatement?: any;
    liveFactChecks?: LiveFactCheck[];
    moderatorReactions?: string[];
    momentumShifts?: number[];
}

export interface CrossExamPhase {
    round1?: {
        questioner: string;
        respondent: string;
        questions: any[];
        answers: any[];
        analysis: any;
    };
    round2?: {
        questioner: string;
        respondent: string;
        questions: any[];
        answers: any[];
        analysis: any;
    };
}

export interface RebuttalPhase {
    proRebuttal?: any;
    conRebuttal?: any;
    moderatorCommentary?: string[];
}

export interface AudiencePhase {
    questions: any[];
    proResponses: any[];
    conResponses: any[];
}

export interface LightningPhase {
    questions: any[];
    proAnswers: any[];
    conAnswers: any[];
    concessionsMade: string[];
}

export interface ClosingPhase {
    conClosing?: any;
    proClosing?: any;
}

export interface DeliberationPhase {
    logicJudge?: JudgeDeliberation;
    evidenceJudge?: JudgeDeliberation;
    rhetoricJudge?: JudgeDeliberation;
}

export interface VerdictPhase {
    logicScore?: EnhancedJudgment;
    evidenceScore?: EnhancedJudgment;
    rhetoricScore?: EnhancedJudgment;
    finalScore?: {
        pro: number;
        con: number;
        winner: string;
        margin: number;
    };
}

export interface Highlight {
    bestMoments: Array<{
        text: string;
        agent: string;
        phase: string;
        type: string;
    }>;
    topQuotes: Array<{
        text: string;
        agent: string;
        context: string;
    }>;
    controversies: ControversyMoment[];
    shareableCards: Array<{
        type: string;
        content: any;
    }>;
}

export interface EnhancedDebateState {
    debateId: string;
    topic: string;
    status: DebatePhase;

    // Current phase tracking
    currentPhase: CurrentPhase;

    // Pre-show content
    preShow?: PreShow;

    // Topic analysis
    analysis?: any;

    // Research montage
    researchMontage?: ResearchMontage;

    // Agents with full personas
    agents?: any[];

    // Phase-based structure
    phases: {
        openingStatements?: OpeningPhase;
        crossExamination?: CrossExamPhase;
        rebuttals?: RebuttalPhase;
        audienceQuestions?: AudiencePhase;
        lightningRound?: LightningPhase;
        closingStatements?: ClosingPhase;
        deliberation?: DeliberationPhase;
        verdict?: VerdictPhase;
    };

    // Live tracking
    momentum?: MomentumState;
    controversyMoments?: ControversyMoment[];
    liveFactChecks?: LiveFactCheck[];

    // Judging
    judging?: any;

    // Synthesis
    synthesis?: EnhancedSynthesis;

    // Highlights for sharing
    highlights?: Highlight;

    // Winner
    winner?: any;

    // Metadata
    createdAt: string;
    updatedAt: string;
}

class EnhancedDebateStore {
    private debates: Map<string, EnhancedDebateState> = new Map();

    set(debateId: string, state: Partial<EnhancedDebateState>) {
        const existing = this.debates.get(debateId) || {
            debateId,
            topic: '',
            status: 'preparing' as DebatePhase,
            currentPhase: {
                type: 'preparing' as DebatePhase,
                progress: 0
            },
            phases: {},
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        this.debates.set(debateId, {
            ...existing,
            ...state,
            debateId,
            updatedAt: new Date().toISOString(),
        });

        console.log(`📊 Debate state updated: ${debateId} - ${state.status || existing.status}`);
    }

    get(debateId: string): EnhancedDebateState | null {
        return this.debates.get(debateId) || null;
    }

    delete(debateId: string) {
        this.debates.delete(debateId);
    }

    getAll(): EnhancedDebateState[] {
        return Array.from(this.debates.values());
    }

    // ===========================
    // PHASE MANAGEMENT
    // ===========================

    updatePhase(debateId: string, phase: DebatePhase, subPhase?: string, progress?: number) {
        const state = this.get(debateId);
        if (state) {
            this.set(debateId, {
                status: phase,
                currentPhase: {
                    type: phase,
                    subPhase,
                    progress: progress ?? state.currentPhase.progress
                }
            });
        }
    }

    // ===========================
    // PRE-SHOW
    // ===========================

    setPreShow(debateId: string, preShow: PreShow) {
        this.set(debateId, { preShow });
    }

    // ===========================
    // RESEARCH MONTAGE
    // ===========================

    initResearchMontage(debateId: string) {
        this.set(debateId, {
            researchMontage: {
                findings: [],
                status: 'in_progress',
                liveUpdates: []
            }
        });
    }

    addResearchUpdate(debateId: string, update: string, finding?: any) {
        const state = this.get(debateId);
        if (state?.researchMontage) {
            const montage = state.researchMontage;
            montage.liveUpdates.push(update);
            if (finding) {
                montage.findings.push(finding);
            }
            this.set(debateId, { researchMontage: montage });
        }
    }

    completeResearchMontage(debateId: string) {
        const state = this.get(debateId);
        if (state?.researchMontage) {
            state.researchMontage.status = 'complete';
            this.set(debateId, { researchMontage: state.researchMontage });
        }
    }

    // ===========================
    // OPENING STATEMENTS
    // ===========================

    setOpeningStatement(debateId: string, side: 'pro' | 'con', statement: any) {
        const state = this.get(debateId);
        if (state) {
            const opening = state.phases.openingStatements || {};
            if (side === 'pro') {
                opening.proStatement = statement;
            } else {
                opening.conStatement = statement;
            }
            this.set(debateId, {
                phases: { ...state.phases, openingStatements: opening }
            });
        }
    }

    // ===========================
    // CROSS-EXAMINATION
    // ===========================

    setCrossExamRound(
        debateId: string,
        roundNum: 1 | 2,
        data: {
            questioner: string;
            respondent: string;
            questions: any[];
            answers: any[];
            analysis: any;
        }
    ) {
        const state = this.get(debateId);
        if (state) {
            const crossExam = state.phases.crossExamination || {};
            if (roundNum === 1) {
                crossExam.round1 = data;
            } else {
                crossExam.round2 = data;
            }
            this.set(debateId, {
                phases: { ...state.phases, crossExamination: crossExam }
            });
        }
    }

    // ===========================
    // REBUTTALS
    // ===========================

    setRebuttal(debateId: string, side: 'pro' | 'con', rebuttal: any) {
        const state = this.get(debateId);
        if (state) {
            const rebuttals = state.phases.rebuttals || {};
            if (side === 'pro') {
                rebuttals.proRebuttal = rebuttal;
            } else {
                rebuttals.conRebuttal = rebuttal;
            }
            this.set(debateId, {
                phases: { ...state.phases, rebuttals }
            });
        }
    }

    // ===========================
    // AUDIENCE QUESTIONS
    // ===========================

    setAudienceQuestions(debateId: string, questions: any[], proResponses: any[], conResponses: any[]) {
        const state = this.get(debateId);
        if (state) {
            this.set(debateId, {
                phases: {
                    ...state.phases,
                    audienceQuestions: { questions, proResponses, conResponses }
                }
            });
        }
    }

    // ===========================
    // LIGHTNING ROUND
    // ===========================

    setLightningRound(debateId: string, data: LightningPhase) {
        const state = this.get(debateId);
        if (state) {
            this.set(debateId, {
                phases: { ...state.phases, lightningRound: data }
            });
        }
    }

    // ===========================
    // CLOSING STATEMENTS
    // ===========================

    setClosingStatement(debateId: string, side: 'pro' | 'con', closing: any) {
        const state = this.get(debateId);
        if (state) {
            const closings = state.phases.closingStatements || {};
            if (side === 'pro') {
                closings.proClosing = closing;
            } else {
                closings.conClosing = closing;
            }
            this.set(debateId, {
                phases: { ...state.phases, closingStatements: closings }
            });
        }
    }

    // ===========================
    // JUDGE DELIBERATION
    // ===========================

    setJudgeDeliberation(
        debateId: string,
        judgeType: 'logicJudge' | 'evidenceJudge' | 'rhetoricJudge',
        deliberation: JudgeDeliberation
    ) {
        const state = this.get(debateId);
        if (state) {
            const delib = state.phases.deliberation || {};
            delib[judgeType] = deliberation;
            this.set(debateId, {
                phases: { ...state.phases, deliberation: delib }
            });
        }
    }

    // ===========================
    // VERDICT
    // ===========================

    setJudgeVerdict(
        debateId: string,
        judgeType: 'logicScore' | 'evidenceScore' | 'rhetoricScore',
        verdict: EnhancedJudgment
    ) {
        const state = this.get(debateId);
        if (state) {
            const verd = state.phases.verdict || {};
            verd[judgeType] = verdict;
            this.set(debateId, {
                phases: { ...state.phases, verdict: verd }
            });
        }
    }

    setFinalScore(debateId: string, finalScore: VerdictPhase['finalScore']) {
        const state = this.get(debateId);
        if (state) {
            const verd = state.phases.verdict || {};
            verd.finalScore = finalScore;
            this.set(debateId, {
                phases: { ...state.phases, verdict: verd }
            });
        }
    }

    // ===========================
    // MOMENTUM TRACKING
    // ===========================

    initMomentum(debateId: string) {
        this.set(debateId, {
            momentum: {
                currentScore: { pro: 0, con: 0 },
                history: [],
                currentLeader: 'tied',
                volatility: 'stable'
            }
        });
    }

    addMomentumEvent(debateId: string, event: any) {
        const state = this.get(debateId);
        if (state?.momentum) {
            const momentum = state.momentum;
            momentum.history.push(event);

            // Update current score
            momentum.currentScore.pro += event.shift > 0 ? event.shift : 0;
            momentum.currentScore.con += event.shift < 0 ? Math.abs(event.shift) : 0;

            // Update leader
            if (momentum.currentScore.pro > momentum.currentScore.con) {
                momentum.currentLeader = 'pro';
            } else if (momentum.currentScore.con > momentum.currentScore.pro) {
                momentum.currentLeader = 'con';
            } else {
                momentum.currentLeader = 'tied';
            }

            this.set(debateId, { momentum });
        }
    }

    // ===========================
    // CONTROVERSY MOMENTS
    // ===========================

    addControversyMoment(debateId: string, moment: ControversyMoment) {
        const state = this.get(debateId);
        if (state) {
            const controversies = state.controversyMoments || [];
            controversies.push(moment);
            this.set(debateId, { controversyMoments: controversies });
        }
    }

    // ===========================
    // LIVE FACT-CHECKS
    // ===========================

    addLiveFactCheck(debateId: string, factCheck: LiveFactCheck) {
        const state = this.get(debateId);
        if (state) {
            const checks = state.liveFactChecks || [];
            checks.push(factCheck);
            this.set(debateId, { liveFactChecks: checks });
        }
    }

    // ===========================
    // SYNTHESIS
    // ===========================

    setSynthesis(debateId: string, synthesis: EnhancedSynthesis) {
        this.set(debateId, { synthesis });
    }

    // ===========================
    // HIGHLIGHTS
    // ===========================

    setHighlights(debateId: string, highlights: Highlight) {
        this.set(debateId, { highlights });
    }
}

export const enhancedDebateStore = new EnhancedDebateStore();
