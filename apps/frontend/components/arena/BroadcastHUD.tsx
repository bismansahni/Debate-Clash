"use client";

import { motion } from "framer-motion";
import type { MomentumData } from "@/types/debate";

interface BroadcastHUDProps {
  topic: string;
  currentPhase: string;
  momentum?: MomentumData;
}

const PHASE_LABELS: Record<string, string> = {
  "opening-statements": "Opening Statements",
  "cross-examination": "Cross-Examination",
  rebuttals: "Rebuttals",
  "audience-questions": "Audience Q&A",
  "lightning-round": "Lightning Round",
  "closing-statements": "Closing Statements",
  deliberation: "Deliberation",
  judging: "Judging",
  verdict: "The Verdict",
};

export function BroadcastHUD({ topic, currentPhase, momentum }: BroadcastHUDProps) {
  const proMomentum = momentum?.currentScore?.pro ?? 50;
  const conMomentum = momentum?.currentScore?.con ?? 50;
  const total = proMomentum + conMomentum || 100;
  const proPercent = Math.round((proMomentum / total) * 100);
  const phaseLabel = PHASE_LABELS[currentPhase] || currentPhase;

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative z-20 flex-shrink-0 border-b border-[var(--arena-border)]"
      style={{ background: "linear-gradient(180deg, var(--arena-bg-alt), var(--arena-bg))" }}
    >
      <div className="px-3 sm:px-6 py-2 sm:py-2.5">
        <div className="flex items-center gap-3 sm:gap-4">
          {/* LIVE badge */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-flicker" />
            <span className="font-[family-name:var(--font-jetbrains)] text-[0.65rem] sm:text-xs text-[#22c55e] uppercase tracking-wider font-bold">
              Live
            </span>
          </div>

          {/* Divider */}
          <div className="w-px h-3 bg-[var(--arena-border)]" />

          {/* Topic */}
          <span className="font-[family-name:var(--font-source-serif)] text-[0.7rem] sm:text-xs text-[var(--arena-text-muted)] truncate flex-1 italic">
            {topic}
          </span>

          {/* Mini momentum */}
          <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0">
            <span className="font-[family-name:var(--font-jetbrains)] text-[0.65rem] text-[var(--pro)]">
              {proPercent}
            </span>
            <div className="w-12 h-1 bg-[var(--arena-surface)] rounded-full overflow-hidden flex">
              <motion.div
                className="h-full rounded-l-full"
                style={{ background: "var(--pro)" }}
                animate={{ width: `${proPercent}%` }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              />
              <motion.div
                className="h-full rounded-r-full"
                style={{ background: "var(--con)" }}
                animate={{ width: `${100 - proPercent}%` }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
            <span className="font-[family-name:var(--font-jetbrains)] text-[0.65rem] text-[var(--con)]">
              {100 - proPercent}
            </span>
          </div>

          {/* Divider */}
          <div className="w-px h-3 bg-[var(--arena-border)]" />

          {/* Phase label */}
          <span className="font-[family-name:var(--font-jetbrains)] text-[0.65rem] sm:text-xs text-[var(--arena-text-muted)] uppercase tracking-wider flex-shrink-0">
            {phaseLabel}
          </span>
        </div>
      </div>
    </motion.header>
  );
}
