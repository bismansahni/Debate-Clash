"use client";

import { motion } from "framer-motion";

interface MomentumBarProps {
  proMomentum: number;
  conMomentum: number;
  proAgent: string;
  conAgent: string;
}

export function MomentumBar({ proMomentum, conMomentum, proAgent, conAgent }: MomentumBarProps) {
  const total = proMomentum + conMomentum || 100;
  const proPercent = Math.round((proMomentum / total) * 100);
  const diff = Math.abs(proMomentum - conMomentum);

  return (
    <div className="arena-panel p-4 sm:p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="font-[family-name:var(--font-jetbrains)] text-xs uppercase tracking-[0.2em] text-[var(--arena-text-dim)]">
          Momentum
        </span>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-flicker" />
          <span className="font-[family-name:var(--font-jetbrains)] text-[0.65rem] text-[var(--arena-text-dim)] uppercase tracking-wider">
            Live
          </span>
        </div>
      </div>

      {/* Agent scores */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="font-[family-name:var(--font-jetbrains)] text-xs text-[var(--arena-text-dim)] truncate mb-0.5">
            {proAgent}
          </div>
          <div className="font-[family-name:var(--font-jetbrains)] text-xl font-light text-[var(--pro)]">
            {proMomentum}%
          </div>
        </div>
        <div className="font-[family-name:var(--font-jetbrains)] text-[0.65rem] text-[var(--arena-text-dim)]">VS</div>
        <div className="text-right">
          <div className="font-[family-name:var(--font-jetbrains)] text-xs text-[var(--arena-text-dim)] truncate mb-0.5">
            {conAgent}
          </div>
          <div className="font-[family-name:var(--font-jetbrains)] text-xl font-light text-[var(--con)]">
            {conMomentum}%
          </div>
        </div>
      </div>

      {/* Bar */}
      <div className="relative h-1.5 bg-[var(--arena-surface)] overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0"
          style={{ background: "var(--pro)" }}
          initial={{ width: "50%" }}
          animate={{ width: `${proPercent}%` }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      {/* Difference indicator */}
      {diff > 10 && (
        <div className="mt-2 text-center">
          <span
            className="font-[family-name:var(--font-jetbrains)] text-xs"
            style={{ color: proMomentum > conMomentum ? "var(--pro)" : "var(--con)" }}
          >
            {diff} point lead
          </span>
        </div>
      )}
    </div>
  );
}
