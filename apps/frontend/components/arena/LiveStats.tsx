// components/arena/LiveStats.tsx
"use client";

import { motion } from "framer-motion";
import { DebateData } from "@/types/debate";

interface LiveStatsProps {
  debate: DebateData;
}

export function LiveStats({ debate }: LiveStatsProps) {
  const stats = calculateDebateStats(debate);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h3 className="text-base sm:text-lg font-bold mb-1">📊 Live Stats</h3>
        <p className="text-xs text-gray-500">Real-time analytics</p>
      </div>

      {debate.momentum?.history && debate.momentum.history.length > 0 && (
        <div className="bg-gray-800/50 rounded-lg sm:rounded-xl p-3 sm:p-4">
          <div className="text-xs sm:text-sm font-semibold text-gray-400 mb-3">MOMENTUM TIMELINE</div>
          <div className="space-y-2">
            {debate.momentum.history.slice(-5).map((event, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${event.shift > 0 ? 'bg-blue-400' : 'bg-purple-400'}`} />
                <div className="flex-1 min-w-0">
                  <div className="truncate text-gray-300">{event.description}</div>
                  <div className="text-gray-600 font-mono">{event.phase}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <StatBox label="Questions" value={stats.totalQuestions} />
        <StatBox label="Concessions" value={stats.totalConcessions} />
        <StatBox label="Evasions" value={stats.totalEvasions} />
        <StatBox label="Clashes" value={stats.totalCounterAttacks} />
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gray-800/50 rounded-lg p-3 text-center"
    >
      <div className="text-2xl sm:text-3xl font-mono font-light mb-1">{value}</div>
      <div className="text-[0.625rem] sm:text-xs text-gray-500 uppercase tracking-wide">{label}</div>
    </motion.div>
  );
}

function calculateDebateStats(debate: DebateData) {
  let totalQuestions = 0;
  let totalConcessions = 0;
  let totalEvasions = 0;
  let totalCounterAttacks = 0;

  if (debate.phases?.crossExamination) {
    [debate.phases.crossExamination.round1, debate.phases.crossExamination.round2]
      .filter(Boolean)
      .forEach(round => {
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
