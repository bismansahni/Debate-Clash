"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { DebateData } from "@/types/debate";
import { AgentDisplay } from "./AgentDisplay";
import { BroadcastHUD } from "./BroadcastHUD";
import { CourtroomLayout, getActiveSpeakers } from "./CourtroomLayout";
import { CrossExamScene } from "./CrossExamScene";
import { LightningRoundScene } from "./LightningRoundScene";
import { OpeningStatementsScene } from "./OpeningStatementsScene";
import { PhaseTimeline } from "./PhaseTimeline";
import { RebuttalsScene } from "./RebuttalsScene";
import { VerdictScene } from "./VerdictScene";
import { ClosingStatementsScene } from "./ClosingStatementsScene";

interface ArenaViewProps {
  debate: DebateData;
}

const PHASE_ORDER = [
  "preparing",
  "opening-statements",
  "cross-examination",
  "rebuttals",
  "lightning-round",
  "closing-statements",
  "verdict",
] as const;

const PHASE_LABELS: Record<string, string> = {
  "preparing": "Preparing",
  "opening-statements": "Opening Statements",
  "cross-examination": "Cross-Examination",
  "rebuttals": "Rebuttals",
  "lightning-round": "Lightning Round",
  "closing-statements": "Closing Statements",
  "verdict": "Verdict",
};

/**
 * Returns the latest phase that has actual data available.
 */
function getLatestPhaseWithData(debate: DebateData): string {
  const p = debate.phases;
  if (p?.verdict?.logicScore || p?.verdict?.evidenceScore || p?.verdict?.rhetoricScore) return "verdict";
  if (p?.closingStatements?.proClosing || p?.closingStatements?.conClosing) return "closing-statements";
  if (p?.lightningRound) return "lightning-round";
  if (p?.rebuttals?.proRebuttal || p?.rebuttals?.conRebuttal) return "rebuttals";
  if (p?.crossExamination?.round1) return "cross-examination";
  if (p?.openingStatements?.proStatement || p?.openingStatements?.conStatement) return "opening-statements";
  return "preparing";
}

function renderPhaseContent(phase: string, debate: DebateData, proAgent: any, conAgent: any) {
  const key = `phase-${phase}`;

  switch (phase) {
    case "preparing":
      return (
        <motion.div
          key={key}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-8"
        >
          {/* Topic Title */}
          <div className="text-center py-8 sm:py-12">
            <span
              className="inline-block px-5 py-2 border font-[family-name:var(--font-jetbrains)]
                         text-[0.65rem] uppercase tracking-[0.25em] mb-6"
              style={{
                borderColor: "var(--arena-border-active)",
                color: "var(--arena-text-muted)",
                background: "var(--arena-surface)",
              }}
            >
              Tonight&apos;s Debate
            </span>

            <h1
              className="font-[family-name:var(--font-chakra)] font-bold
                       text-3xl sm:text-4xl lg:text-5xl xl:text-6xl
                       text-[var(--arena-text)] leading-tight mb-6 px-4"
            >
              {debate.topic}
            </h1>

            <div className="flex items-center justify-center gap-3">
              <div className="w-16 h-px bg-gradient-to-r from-transparent to-[var(--pro)]" />
              <span
                className="font-[family-name:var(--font-jetbrains)] text-[0.6rem]
                           uppercase tracking-[0.3em] text-[var(--arena-text-dim)]"
              >
                Live Combat
              </span>
              <div className="w-16 h-px bg-gradient-to-l from-transparent to-[var(--con)]" />
            </div>
          </div>

          {/* Agent intro cards */}
          {proAgent && conAgent && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              <AgentDisplay agent={proAgent} side="pro" index={0} />
              <AgentDisplay agent={conAgent} side="con" index={1} />
            </div>
          )}
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

    case "closing-statements":
      return (
        <motion.div
          key={key}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          <ClosingStatementsScene
            proClosing={debate.phases?.closingStatements?.proClosing}
            conClosing={debate.phases?.closingStatements?.conClosing}
            proAgent={proAgent?.persona?.name}
            conAgent={conAgent?.persona?.name}
          />
        </motion.div>
      );

    case "verdict": {
      const verdictData = debate.phases?.verdict;
      const judges = verdictData
        ? [
            verdictData.logicScore && {
              name: verdictData.logicScore.judgeName,
              expertise: "Logical Reasoning",
              scores: verdictData.logicScore.scores,
              reasoning: verdictData.logicScore.verdict,
            },
            verdictData.evidenceScore && {
              name: verdictData.evidenceScore.judgeName,
              expertise: "Evidence & Data",
              scores: verdictData.evidenceScore.scores,
              reasoning: verdictData.evidenceScore.verdict,
            },
            verdictData.rhetoricScore && {
              name: verdictData.rhetoricScore.judgeName,
              expertise: "Rhetoric & Persuasion",
              scores: verdictData.rhetoricScore.scores,
              reasoning: verdictData.rhetoricScore.verdict,
            },
          ].filter((j): j is { name: string; expertise: string; scores: { pro: number; con: number }; reasoning: string } => Boolean(j))
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
  const [viewedIdx, setViewedIdx] = useState(0);

  // Latest phase that actually has data ready
  const latestWithData = getLatestPhaseWithData(debate);
  const latestIdx = PHASE_ORDER.indexOf(latestWithData as typeof PHASE_ORDER[number]);

  // Phase the user is currently viewing
  const viewedPhase = PHASE_ORDER[viewedIdx] ?? "preparing";

  // Can go forward / back?
  const canNext = latestIdx > viewedIdx;
  const canPrev = viewedIdx > 0;

  const nextPhaseLabel = canNext ? PHASE_LABELS[PHASE_ORDER[viewedIdx + 1] ?? ""] : null;

  const proAgent = debate.agents?.find((a) => a.side === "pro");
  const conAgent = debate.agents?.find((a) => a.side === "con");
  const isPreparing = viewedPhase === "preparing";
  const activeSpeakers = getActiveSpeakers(viewedPhase);

  return (
    <div className="h-screen arena-bg arena-grain arena-scanlines flex flex-col overflow-hidden">
      {/* Background grid */}
      <div className="fixed inset-0 arena-grid pointer-events-none" />

      {/* Simplified HUD -- only after preparing */}
      {!isPreparing && <BroadcastHUD topic={debate.topic} currentPhase={viewedPhase} momentum={debate.momentum} />}

      {/* Phase Timeline */}
      {!isPreparing && (
        <div className="relative z-10 border-b border-[var(--arena-border)] flex-shrink-0">
          <PhaseTimeline currentPhase={viewedPhase} progress={debate.currentPhase?.progress || 0} />
        </div>
      )}

      {/* Main: Courtroom + Content */}
      <main className="relative z-10 flex-1 overflow-hidden flex flex-col">
        {/* Persistent Courtroom Layout -- appears after preparing, stays for all phases */}
        {!isPreparing && debate.agents && debate.agents.length > 0 && (
          <div className="flex-shrink-0 border-b border-[var(--arena-border)]">
            <CourtroomLayout
              agents={debate.agents}
              currentPhase={viewedPhase}
              momentum={debate.momentum}
              activeSpeakers={activeSpeakers}
            />
          </div>
        )}

        {/* Scrollable Content Panel */}
        <div className="flex-1 overflow-y-auto arena-scroll px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="max-w-5xl mx-auto">
            <AnimatePresence mode="wait">
              {renderPhaseContent(viewedPhase, debate, proAgent, conAgent)}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Navigation controls */}
      <div className="relative z-50 flex-shrink-0 border-t border-[var(--arena-border)] bg-[var(--arena-bg)]">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3">
          {/* Previous button */}
          <button
            onClick={() => setViewedIdx((i) => i - 1)}
            disabled={!canPrev}
            className="px-4 py-2 font-[family-name:var(--font-jetbrains)] text-xs uppercase tracking-[0.15em]
                       border border-[var(--arena-border)] text-[var(--arena-text-muted)]
                       hover:border-[var(--arena-border-active)] hover:text-[var(--arena-text)]
                       transition-all duration-200
                       disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:border-[var(--arena-border)]
                       disabled:hover:text-[var(--arena-text-muted)]"
          >
            Prev
          </button>

          {/* Current phase indicator */}
          <span className="font-[family-name:var(--font-chakra)] text-sm text-[var(--arena-text-muted)] uppercase tracking-[0.1em]">
            {PHASE_LABELS[viewedPhase] ?? viewedPhase}
          </span>

          {/* Next button */}
          {canNext ? (
            <motion.button
              onClick={() => setViewedIdx((i) => i + 1)}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="group relative px-5 py-2 font-[family-name:var(--font-chakra)] font-semibold
                         text-xs uppercase tracking-[0.15em]
                         border border-[var(--pro)] text-[var(--arena-text)]
                         hover:bg-[var(--pro-dim)] transition-all duration-200"
            >
              <span className="relative z-10">
                Next: {nextPhaseLabel}
              </span>
              {/* Pulse to draw attention */}
              <div className="absolute inset-0 border border-[var(--pro)] opacity-40 pulse-ring" />
            </motion.button>
          ) : (
            <div className="px-5 py-2 font-[family-name:var(--font-jetbrains)] text-xs text-[var(--arena-text-dim)]
                            uppercase tracking-[0.15em] flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-1 h-1 rounded-full bg-[var(--pro)] animate-pulse" />
                <div className="w-1 h-1 rounded-full bg-[var(--arena-text-dim)] animate-pulse delay-75" />
                <div className="w-1 h-1 rounded-full bg-[var(--con)] animate-pulse delay-150" />
              </div>
              {viewedIdx >= PHASE_ORDER.length - 1 ? "Final Phase" : "Waiting..."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
