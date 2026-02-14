"use client";

import { motion } from "framer-motion";
import type { DebateData } from "@/types/debate";

interface LiveStatsProps {
  debate: DebateData;
}

export function LiveStats({ debate }: LiveStatsProps) {
  const stats = calculateDebateStats(debate);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="font-[family-name:var(--font-jetbrains)] text-[0.6rem] uppercase tracking-[0.2em] text-[var(--arena-text-dim)]">
          Live Stats
        </span>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-flicker" />
          <span className="font-[family-name:var(--font-jetbrains)] text-[0.5rem] text-[var(--arena-text-dim)]">
            LIVE
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <StatBox label="Questions" value={stats.totalQuestions} />
        <StatBox label="Concessions" value={stats.totalConcessions} />
        <StatBox label="Evasions" value={stats.totalEvasions} />
        <StatBox label="Clashes" value={stats.totalCounterAttacks} />
      </div>

      {debate.momentum?.history && debate.momentum.history.length > 0 && (
        <div className="arena-panel p-3">
          <div className="font-[family-name:var(--font-jetbrains)] text-[0.55rem] uppercase tracking-wider text-[var(--arena-text-dim)] mb-2">
            Recent Shifts
          </div>
          <div className="space-y-1.5">
            {debate.momentum.history.slice(-3).map((event, idx) => (
              <div key={idx} className="flex items-center gap-2 text-[0.55rem]">
                <div
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: event.shift > 0 ? "var(--pro)" : "var(--con)" }}
                />
                <span className="font-[family-name:var(--font-source-serif)] text-[var(--arena-text-muted)] truncate">
                  {event.description}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="arena-panel p-3 text-center"
    >
      <div className="font-[family-name:var(--font-jetbrains)] text-xl font-light text-[var(--arena-text)] mb-0.5">
        {value}
      </div>
      <div className="font-[family-name:var(--font-jetbrains)] text-[0.5rem] uppercase tracking-wider text-[var(--arena-text-dim)]">
        {label}
      </div>
    </motion.div>
  );
}

function calculateDebateStats(debate: DebateData) {
  let totalQuestions = 0;
  let totalConcessions = 0;
  let totalEvasions = 0;
  let totalCounterAttacks = 0;

  if (debate.phases?.crossExamination) {
    [debate.phases.crossExamination.round1, debate.phases.crossExamination.round2].filter(Boolean).forEach((round) => {
      if (round) {
        totalQuestions += round.questions.length;
        totalConcessions += round.analysis.concessions_made.length;
        totalEvasions += round.analysis.evasions.length;
        totalCounterAttacks += round.analysis.counter_attacks.length;
      }
    });
  }

  if (debate.phases?.lightningRound) {
    totalConcessions += debate.phases.lightningRound.concessionsMade.length;
    totalQuestions += debate.phases.lightningRound.questions.length;
  }

  return { totalQuestions, totalConcessions, totalEvasions, totalCounterAttacks };
}
