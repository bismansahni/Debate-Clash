/**
 * Enhanced in-memory debate state store
 * Simplified for one-liner debate format
 */

import type {
  ControversyMoment,
  MomentumState,
  QuickJudgment,
} from "../schemas/enhanced-types.ts";

// Phase types
export type DebatePhase =
  | "preparing"
  | "opening-statements"
  | "cross-examination"
  | "rebuttals"
  | "lightning-round"
  | "closing-statements"
  | "verdict"
  | "completed"
  | "error";

export interface CurrentPhase {
  type: DebatePhase;
  subPhase?: string | undefined;
  progress: number; // 0-1
}

export interface OpeningPhase {
  proStatement?: any;
  conStatement?: any;
}

export interface CrossExamPhase {
  round1?: {
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

export interface VerdictPhase {
  logicScore?: QuickJudgment | undefined;
  evidenceScore?: QuickJudgment | undefined;
  rhetoricScore?: QuickJudgment | undefined;
  finalScore?:
    | {
        pro: number;
        con: number;
        winner: string;
        margin: number;
      }
    | undefined;
}

export interface EnhancedDebateState {
  debateId: string;
  topic: string;
  status: DebatePhase;

  // Current phase tracking
  currentPhase: CurrentPhase;

  // Topic analysis
  analysis?: any;

  // Agents with full personas
  agents?: any[];

  // Phase-based structure
  phases: {
    openingStatements?: OpeningPhase;
    crossExamination?: CrossExamPhase;
    rebuttals?: RebuttalPhase;
    lightningRound?: LightningPhase;
    closingStatements?: ClosingPhase;
    verdict?: VerdictPhase;
  };

  // Live tracking
  momentum?: MomentumState;
  controversyMoments?: ControversyMoment[];

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
      topic: "",
      status: "preparing" as DebatePhase,
      currentPhase: {
        type: "preparing" as DebatePhase,
        progress: 0,
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
          progress: progress ?? state.currentPhase.progress,
        },
      });
    }
  }

  // ===========================
  // OPENING STATEMENTS
  // ===========================

  setOpeningStatement(debateId: string, side: "pro" | "con", statement: any) {
    const state = this.get(debateId);
    if (state) {
      const opening = state.phases.openingStatements || {};
      if (side === "pro") {
        opening.proStatement = statement;
      } else {
        opening.conStatement = statement;
      }
      this.set(debateId, {
        phases: { ...state.phases, openingStatements: opening },
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
    },
  ) {
    const state = this.get(debateId);
    if (state) {
      const crossExam = state.phases.crossExamination || {};
      if (roundNum === 1) {
        crossExam.round1 = data;
      }
      this.set(debateId, {
        phases: { ...state.phases, crossExamination: crossExam },
      });
    }
  }

  // ===========================
  // REBUTTALS
  // ===========================

  setRebuttal(debateId: string, side: "pro" | "con", rebuttal: any) {
    const state = this.get(debateId);
    if (state) {
      const rebuttals = state.phases.rebuttals || {};
      if (side === "pro") {
        rebuttals.proRebuttal = rebuttal;
      } else {
        rebuttals.conRebuttal = rebuttal;
      }
      this.set(debateId, {
        phases: { ...state.phases, rebuttals },
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
        phases: { ...state.phases, lightningRound: data },
      });
    }
  }

  // ===========================
  // CLOSING STATEMENTS
  // ===========================

  setClosingStatement(debateId: string, side: "pro" | "con", closing: any) {
    const state = this.get(debateId);
    if (state) {
      const closings = state.phases.closingStatements || {};
      if (side === "pro") {
        closings.proClosing = closing;
      } else {
        closings.conClosing = closing;
      }
      this.set(debateId, {
        phases: { ...state.phases, closingStatements: closings },
      });
    }
  }

  // ===========================
  // VERDICT
  // ===========================

  setJudgeVerdict(
    debateId: string,
    judgeType: "logicScore" | "evidenceScore" | "rhetoricScore",
    verdict: QuickJudgment,
  ) {
    const state = this.get(debateId);
    if (state) {
      const verd = state.phases.verdict || {};
      verd[judgeType] = verdict;
      this.set(debateId, {
        phases: { ...state.phases, verdict: verd },
      });
    }
  }

  setFinalScore(debateId: string, finalScore: VerdictPhase["finalScore"]) {
    const state = this.get(debateId);
    if (state) {
      const verd = state.phases.verdict || {};
      verd.finalScore = finalScore;
      this.set(debateId, {
        phases: { ...state.phases, verdict: verd },
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
        currentLeader: "tied",
        volatility: "stable",
      },
    });
  }

  addMomentumEvent(debateId: string, event: any) {
    const state = this.get(debateId);
    if (state?.momentum) {
      const momentum = state.momentum;
      momentum.history.push(event);

      momentum.currentScore.pro += event.shift > 0 ? event.shift : 0;
      momentum.currentScore.con += event.shift < 0 ? Math.abs(event.shift) : 0;

      if (momentum.currentScore.pro > momentum.currentScore.con) {
        momentum.currentLeader = "pro";
      } else if (momentum.currentScore.con > momentum.currentScore.pro) {
        momentum.currentLeader = "con";
      } else {
        momentum.currentLeader = "tied";
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
}

export const enhancedDebateStore = new EnhancedDebateStore();
