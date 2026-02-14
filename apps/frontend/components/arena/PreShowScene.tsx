"use client";

import { motion } from "framer-motion";
import type { Agent, PreShowData } from "@/types/debate";

interface PreShowSceneProps {
  data?: PreShowData;
  agents?: Agent[];
  topic: string;
}

export function PreShowScene({ data, agents = [], topic }: PreShowSceneProps) {
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="flex gap-1.5 mb-4">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--pro)] animate-pulse" />
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--arena-text-muted)] animate-pulse delay-75" />
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--con)] animate-pulse delay-150" />
        </div>
        <p className="font-[family-name:var(--font-jetbrains)] text-xs text-[var(--arena-text-dim)] uppercase tracking-widest">
          Generating pre-show...
        </p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      {/* Cinematic Topic Title */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="text-center py-8 sm:py-12"
      >
        {/* Tonight's Debate badge */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <span
            className="inline-block px-5 py-2 border font-[family-name:var(--font-jetbrains)]
                       text-[0.65rem] uppercase tracking-[0.25em]"
            style={{
              borderColor: "var(--arena-border-active)",
              color: "var(--arena-text-muted)",
              background: "var(--arena-surface)",
            }}
          >
            Tonight&apos;s Debate
          </span>
        </motion.div>

        {/* Topic */}
        <h1
          className="font-[family-name:var(--font-chakra)] font-bold
                   text-3xl sm:text-4xl lg:text-5xl xl:text-6xl
                   text-[var(--arena-text)] leading-tight mb-6 px-4"
        >
          {topic}
        </h1>

        {/* Decorative divider */}
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
      </motion.div>

      {/* Context Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="arena-panel p-5 sm:p-6"
      >
        <div className="flex items-start gap-4">
          <div
            className="flex-shrink-0 w-8 h-8 rounded-sm flex items-center justify-center border"
            style={{
              borderColor: "var(--pro)",
              background: "var(--pro-dim)",
            }}
          >
            <span className="font-[family-name:var(--font-jetbrains)] text-[0.6rem] text-[var(--pro)]">CTX</span>
          </div>
          <div className="flex-1">
            <h3 className="font-[family-name:var(--font-chakra)] font-semibold text-sm mb-2 text-[var(--arena-text)]">
              Why This Matters
            </h3>
            <p className="font-[family-name:var(--font-source-serif)] text-sm text-[var(--arena-text-muted)] leading-relaxed">
              {data.context}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stakes Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="arena-panel p-5 sm:p-6"
      >
        <div className="flex items-start gap-4">
          <div
            className="flex-shrink-0 w-8 h-8 rounded-sm flex items-center justify-center border"
            style={{
              borderColor: "var(--con)",
              background: "var(--con-dim)",
            }}
          >
            <span className="font-[family-name:var(--font-jetbrains)] text-[0.6rem] text-[var(--con)]">STK</span>
          </div>
          <div className="flex-1">
            <h3 className="font-[family-name:var(--font-chakra)] font-semibold text-sm mb-2 text-[var(--arena-text)]">
              What&apos;s at Stake
            </h3>
            <p className="font-[family-name:var(--font-source-serif)] text-sm text-[var(--arena-text-muted)] leading-relaxed">
              {data.stakes}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Prediction + Odds */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="arena-panel glow-gold p-5 sm:p-6"
      >
        <div className="flex items-start gap-4">
          <div
            className="flex-shrink-0 w-8 h-8 rounded-sm flex items-center justify-center border"
            style={{
              borderColor: "var(--gold)",
              background: "var(--gold-dim)",
            }}
          >
            <span className="font-[family-name:var(--font-jetbrains)] text-[0.6rem] text-[var(--gold)]">PRD</span>
          </div>
          <div className="flex-1">
            <h3 className="font-[family-name:var(--font-chakra)] font-semibold text-sm mb-2 text-[var(--gold)]">
              AI Prediction
            </h3>
            <p className="font-[family-name:var(--font-source-serif)] text-sm text-[var(--arena-text-muted)] leading-relaxed mb-4">
              {data.predictions}
            </p>

            {/* Odds display */}
            {data.odds && (
              <div className="flex items-center gap-4 pt-4 border-t border-[var(--arena-border)]">
                <div className="flex-1 text-center">
                  <div className="font-[family-name:var(--font-jetbrains)] text-[0.55rem] uppercase tracking-wider text-[var(--arena-text-dim)] mb-1">
                    PRO ODDS
                  </div>
                  <div className="font-[family-name:var(--font-jetbrains)] text-2xl font-light text-[var(--pro)]">
                    {data.odds.pro}%
                  </div>
                </div>
                <div className="w-px h-10 bg-[var(--arena-border)]" />
                <div className="flex-1 text-center">
                  <div className="font-[family-name:var(--font-jetbrains)] text-[0.55rem] uppercase tracking-wider text-[var(--arena-text-dim)] mb-1">
                    CON ODDS
                  </div>
                  <div className="font-[family-name:var(--font-jetbrains)] text-2xl font-light text-[var(--con)]">
                    {data.odds.con}%
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
