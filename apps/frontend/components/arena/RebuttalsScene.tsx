"use client";

import { motion } from "framer-motion";
import { TypewriterText } from "@/components/ui/TypewriterText";

interface RebuttalsSceneProps {
  proRebuttal?: any;
  conRebuttal?: any;
  proAgent?: string;
  conAgent?: string;
}

function getRebuttalText(rebuttal: any): string {
  if (typeof rebuttal === "string") return rebuttal;
  if (rebuttal?.mainPoints) return rebuttal.mainPoints.join("\n\n");
  return JSON.stringify(rebuttal);
}

export function RebuttalsScene({ proRebuttal, conRebuttal, proAgent = "Pro", conAgent = "Con" }: RebuttalsSceneProps) {
  if (!proRebuttal && !conRebuttal) {
    return (
      <div className="flex flex-col items-center justify-center py-10 sm:py-16">
        <div className="flex gap-1.5 mb-4">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--pro)] animate-pulse" />
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--arena-text-muted)] animate-pulse delay-75" />
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--con)] animate-pulse delay-150" />
        </div>
        <p className="font-[family-name:var(--font-jetbrains)] text-xs text-[var(--arena-text-dim)] uppercase tracking-widest">
          Rebuttals loading...
        </p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 sm:space-y-6">
      {/* Phase Header */}
      <div className="text-center">
        <div className="font-[family-name:var(--font-jetbrains)] text-[0.6rem] uppercase tracking-[0.3em] text-[var(--arena-text-dim)] mb-2">
          Phase 03
        </div>
        <h2 className="font-[family-name:var(--font-chakra)] font-bold text-xl sm:text-2xl lg:text-3xl text-[var(--arena-text)]">
          Rebuttals
        </h2>
        <p className="font-[family-name:var(--font-jetbrains)] text-[0.6rem] text-[var(--arena-text-dim)] uppercase tracking-wider mt-1">
          Direct responses to opponent&apos;s arguments
        </p>
      </div>

      {/* Rebuttal Cards — simplified, no avatar headers */}
      <div className="space-y-4">
        {proRebuttal && (
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="arena-panel glow-pro overflow-hidden"
          >
            <div className="h-[0.125rem] w-full" style={{ background: "var(--pro)" }} />
            <div className="p-4 sm:p-5 lg:p-6">
              <div className="font-[family-name:var(--font-jetbrains)] text-[0.55rem] uppercase tracking-wider mb-3 text-[var(--pro)]">
                {proAgent} &mdash; Rebuttal
              </div>
              <TypewriterText
                text={getRebuttalText(proRebuttal)}
                speed={12}
                className="font-[family-name:var(--font-source-serif)] text-sm sm:text-base
                         text-[var(--arena-text-muted)] leading-relaxed whitespace-pre-line"
              />
            </div>
          </motion.div>
        )}

        {conRebuttal && (
          <motion.div
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="arena-panel glow-con overflow-hidden"
          >
            <div className="h-[0.125rem] w-full" style={{ background: "var(--con)" }} />
            <div className="p-4 sm:p-5 lg:p-6">
              <div className="font-[family-name:var(--font-jetbrains)] text-[0.55rem] uppercase tracking-wider mb-3 text-[var(--con)]">
                {conAgent} &mdash; Rebuttal
              </div>
              <TypewriterText
                text={getRebuttalText(conRebuttal)}
                speed={12}
                className="font-[family-name:var(--font-source-serif)] text-sm sm:text-base
                         text-[var(--arena-text-muted)] leading-relaxed whitespace-pre-line"
              />
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
