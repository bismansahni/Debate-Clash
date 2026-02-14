// types/debate.ts

export interface AgentPersona {
  name: string;
  age?: number;
  background: string;
  traits: {
    speaking_style: string;
    emotional_range: string;
    rhetoric_preference: string;
    tone: string;
    catchphrases?: string[];
    weaknesses?: string;
  };
  motivation: string;
  debate_style: {
    opening_move: string;
    argumentation: string;
    engagement_with_opponent: string;
    closing_move: string;
  };
}

export interface Agent {
  id: string;
  position: string;
  stance: string;
  side: "pro" | "con";
  persona: AgentPersona;
  systemPrompt: string;
}

export interface PreShowData {
  context: string;
  stakes: string;
  predictions: string;
  odds: {
    pro: number;
    con: number;
  };
}

export interface CrossExamQuestion {
  question: string;
  intent: string;
  target_weakness: string;
}

export interface CrossExamAnswer {
  answer: string;
  strategy: string;
  evasion: boolean;
}

export interface CrossExamAnalysis {
  directness_score: number;
  concessions_made: string[];
  counter_attacks: string[];
  evasions: string[];
  winner: string;
  key_exchange: string;
}

export interface CrossExamRound {
  questioner: string;
  respondent: string;
  questions: CrossExamQuestion[];
  answers: CrossExamAnswer[];
  analysis: CrossExamAnalysis;
}

export interface MomentumEvent {
  timestamp: Date;
  phase: string;
  description: string;
  shift: number;
  reason: string;
}

export interface MomentumScore {
  pro: number;
  con: number;
}

export interface MomentumData {
  currentScore: MomentumScore;
  history: MomentumEvent[];
  currentLeader: "pro" | "con" | "tied";
  volatility: "stable" | "volatile";
}

export interface ControversyMoment {
  timestamp: Date;
  phase: string;
  severity: number;
  description: string;
  agentInvolved: string;
}

export interface LightningRoundData {
  questions: Array<{
    question: string;
    time_limit_seconds: number;
    forces_position: boolean;
  }>;
  proAnswers: Array<{
    answer: string;
    concession_made: boolean;
    directness: number;
  }>;
  conAnswers: Array<{
    answer: string;
    concession_made: boolean;
    directness: number;
  }>;
  concessionsMade: string[];
}

export interface DebateData {
  debateId: string;
  topic: string;
  status: string;
  currentPhase?: {
    type: string;
    progress: number;
  };
  analysis?: any;
  agents?: Agent[];
  momentum?: MomentumData;
  phases?: {
    preShow?: PreShowData;
    openingStatements?: {
      proStatement?: any;
      conStatement?: any;
    };
    crossExamination?: {
      round1?: CrossExamRound;
      round2?: CrossExamRound;
    };
    rebuttals?: {
      proRebuttal?: any;
      conRebuttal?: any;
    };
    audienceQuestions?: {
      questions: Array<{
        persona: {
          name: string;
          age?: number;
          perspective: string;
          bias: string;
        };
        question: string;
        challenges: string;
        forces_specificity: boolean;
      }>;
      proResponses: Array<{
        question: string;
        persona: string;
        answer: string;
      }>;
      conResponses: Array<{
        question: string;
        persona: string;
        answer: string;
      }>;
    };
    lightningRound?: LightningRoundData;
    closingStatements?: {
      proClosing?: any;
      conClosing?: any;
    };
    verdict?: {
      logicScore?: any;
      evidenceScore?: any;
      rhetoricScore?: any;
      finalScore?: {
        pro: number;
        con: number;
        winner: string;
        margin: number;
      };
    };
    deliberation?: {
      logicJudge?: any;
      evidenceJudge?: any;
      rhetoricJudge?: any;
    };
  };
  controversyMoments?: ControversyMoment[];
}
