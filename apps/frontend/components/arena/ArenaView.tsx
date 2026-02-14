"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { DebateData } from "@/types/debate";
import { AgentDisplay } from "./AgentDisplay";
import { AudienceQuestionScene } from "./AudienceQuestionScene";
import { BroadcastHUD } from "./BroadcastHUD";
import { CourtroomLayout, getActiveSpeakers } from "./CourtroomLayout";
import { CrossExamScene } from "./CrossExamScene";
import { LightningRoundScene } from "./LightningRoundScene";
import { OpeningStatementsScene } from "./OpeningStatementsScene";
import { PhaseTimeline } from "./PhaseTimeline";
import { PreShowScene } from "./PreShowScene";
import { RebuttalsScene } from "./RebuttalsScene";
import { VerdictScene } from "./VerdictScene";

interface ArenaViewProps {
  debate: DebateData;
}

function renderPhaseContent(phase: string, debate: DebateData, proAgent: any, conAgent: any) {
  const key = `phase-${phase}`;

  switch (phase) {
    case "pre-show":
    case "preparing":
    case "researching":
      return (
        <motion.div
          key={key}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-8"
        >
          {proAgent && conAgent && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              <AgentDisplay agent={proAgent} side="pro" index={0} />
              <AgentDisplay agent={conAgent} side="con" index={1} />
            </div>
          )}
          <PreShowScene data={debate.phases?.preShow} agents={debate.agents} topic={debate.topic} />
        </motion.div>
      );

    case "opening-statements":
      return (
        <motion.div
          key={key}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          <OpeningStatementsScene
            proStatement={debate.phases?.openingStatements?.proStatement}
            conStatement={debate.phases?.openingStatements?.conStatement}
            proAgent={proAgent?.persona?.name}
            conAgent={conAgent?.persona?.name}
          />
        </motion.div>
      );

    case "cross-examination":
      return (
        <motion.div
          key={key}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          <CrossExamScene
            round1={debate.phases?.crossExamination?.round1}
            round2={debate.phases?.crossExamination?.round2}
            proAgent={proAgent?.persona?.name}
            conAgent={conAgent?.persona?.name}
          />
        </motion.div>
      );

    case "rebuttals":
      return (
        <motion.div
          key={key}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          <RebuttalsScene
            proRebuttal={debate.phases?.rebuttals?.proRebuttal}
            conRebuttal={debate.phases?.rebuttals?.conRebuttal}
            proAgent={proAgent?.persona?.name}
            conAgent={conAgent?.persona?.name}
          />
        </motion.div>
      );

    case "audience-questions":
      return (
        <motion.div
          key={key}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          <AudienceQuestionScene
            questions={debate.phases?.audienceQuestions?.questions}
            proResponses={debate.phases?.audienceQuestions?.proResponses}
            conResponses={debate.phases?.audienceQuestions?.conResponses}
            proAgent={proAgent?.persona?.name}
            conAgent={conAgent?.persona?.name}
          />
        </motion.div>
      );

    case "lightning-round":
      return (
        <motion.div
          key={key}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          <LightningRoundScene
            data={debate.phases?.lightningRound}
            proAgent={proAgent?.persona?.name}
            conAgent={conAgent?.persona?.name}
          />
        </motion.div>
      );

    case "verdict":
    case "judging":
    case "deliberation": {
      const verdictData = debate.phases?.verdict;
      const judges = verdictData
        ? [
            verdictData.logicScore && {
              name: "Prof. Ada Lovelace",
              expertise: "Logical Reasoning",
              scores: verdictData.logicScore.scores,
              reasoning: verdictData.logicScore.reasoning,
            },
            verdictData.evidenceScore && {
              name: "Dr. Carl Sagan",
              expertise: "Evidence & Data",
              scores: verdictData.evidenceScore.scores,
              reasoning: verdictData.evidenceScore.reasoning,
            },
            verdictData.rhetoricScore && {
              name: "Maya Angelou",
              expertise: "Rhetoric & Persuasion",
              scores: verdictData.rhetoricScore.scores,
              reasoning: verdictData.rhetoricScore.reasoning,
            },
          ].filter(Boolean)
        : undefined;

      const winner = verdictData?.finalScore
        ? {
            winner: verdictData.finalScore.winner,
            totalScore: verdictData.finalScore.pro + verdictData.finalScore.con,
            proScore: verdictData.finalScore.pro,
            conScore: verdictData.finalScore.con,
          }
        : undefined;

      return (
        <motion.div
          key={key}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          <VerdictScene
            judges={judges}
            winner={winner}
            proAgent={proAgent?.persona?.name}
            conAgent={conAgent?.persona?.name}
          />
        </motion.div>
      );
    }

    default:
      return (
        <motion.div
          key={key}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20"
        >
          <div className="flex gap-1.5 mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--pro)] animate-pulse" />
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--arena-text-muted)] animate-pulse delay-75" />
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--con)] animate-pulse delay-150" />
          </div>
          <p className="font-[family-name:var(--font-jetbrains)] text-xs text-[var(--arena-text-dim)] uppercase tracking-widest">
            {phase || "Initializing..."}
          </p>
        </motion.div>
      );
  }
}

export function ArenaView({ debate }: ArenaViewProps) {
  const currentPhase = debate.currentPhase?.type || "preparing";
  const proAgent = debate.agents?.find((a) => a.side === "pro");
  const conAgent = debate.agents?.find((a) => a.side === "con");
  const isPreShow = ["preparing", "researching", "pre-show"].includes(currentPhase);
  const activeSpeakers = getActiveSpeakers(currentPhase);

  return (
    <div className="h-screen arena-bg arena-grain arena-scanlines flex flex-col overflow-hidden">
      {/* Background grid */}
      <div className="fixed inset-0 arena-grid pointer-events-none" />

      {/* Simplified HUD — only after pre-show */}
      {!isPreShow && <BroadcastHUD topic={debate.topic} currentPhase={currentPhase} momentum={debate.momentum} />}

      {/* Phase Timeline */}
      {!isPreShow && (
        <div className="relative z-10 border-b border-[var(--arena-border)] flex-shrink-0">
          <PhaseTimeline currentPhase={currentPhase} progress={debate.currentPhase?.progress || 0} />
        </div>
      )}

      {/* Main: Courtroom + Content */}
      <main className="relative z-10 flex-1 overflow-hidden flex flex-col">
        {/* Persistent Courtroom Layout — appears after pre-show, stays for all phases */}
        {!isPreShow && debate.agents && debate.agents.length > 0 && (
          <div className="flex-shrink-0 border-b border-[var(--arena-border)]">
            <CourtroomLayout
              agents={debate.agents}
              currentPhase={currentPhase}
              momentum={debate.momentum}
              activeSpeakers={activeSpeakers}
            />
          </div>
        )}

        {/* Scrollable Content Panel */}
        <div className="flex-1 overflow-y-auto arena-scroll px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="max-w-5xl mx-auto">
            <AnimatePresence mode="wait">
              {renderPhaseContent(currentPhase, debate, proAgent, conAgent)}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
