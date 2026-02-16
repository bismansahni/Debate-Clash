"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { useWindowSize } from "@/hooks/use-window-size";

interface Judge {
  name: string;
  expertise: string;
  scores: {
    pro: number;
    con: number;
  };
  reasoning?: string;
}

interface VerdictSceneProps {
  judges?: Judge[];
  winner?: {
    winner: string;
    totalScore: number;
    proScore: number;
    conScore: number;
  };
  proAgent?: string;
  conAgent?: string;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function VerdictScene({ judges = [], winner, proAgent = "Pro", conAgent = "Con" }: VerdictSceneProps) {
  const [revealedJudges, setRevealedJudges] = useState(0);
  const [showFinalVerdict, setShowFinalVerdict] = useState(false);
  const { width, height } = useWindowSize();

  useEffect(() => {
    if (revealedJudges < judges.length) {
      const timer = setTimeout(() => {
        setRevealedJudges((prev) => prev + 1);
      }, 2000);
      return () => clearTimeout(timer);
    } else if (revealedJudges === judges.length && judges.length > 0 && !showFinalVerdict) {
      const timer = setTimeout(() => {
        setShowFinalVerdict(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [revealedJudges, judges.length, showFinalVerdict]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      {/* Phase Header */}
      <div className="text-center">
        <div className="font-[family-name:var(--font-jetbrains)] text-xs uppercase tracking-[0.3em] text-[var(--arena-text-dim)] mb-2">
          Final Phase
        </div>
        <h2 className="font-[family-name:var(--font-chakra)] font-bold text-3xl sm:text-4xl lg:text-5xl text-[var(--arena-text)]">
          The Verdict
        </h2>
        <p className="font-[family-name:var(--font-jetbrains)] text-xs text-[var(--arena-text-dim)] uppercase tracking-wider mt-2">
          Three judges. Three verdicts. One winner.
        </p>
      </div>

      {/* Judge Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {judges.map((judge, idx) => (
          <AnimatePresence key={idx}>
            {idx < revealedJudges && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                }}
                className="arena-panel glow-gold overflow-hidden"
              >
                {/* Gold top bar */}
                <div className="h-0.5 w-full" style={{ background: "var(--gold)" }} />

                <div className="p-4 sm:p-5">
                  {/* Judge identity */}
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-10 h-10 rounded-sm flex items-center justify-center border
                                 font-[family-name:var(--font-chakra)] font-bold text-xs"
                      style={{
                        borderColor: "var(--gold)",
                        background: "var(--gold-dim)",
                        color: "var(--gold)",
                      }}
                    >
                      {getInitials(judge.name)}
                    </div>
                    <div>
                      <div className="font-[family-name:var(--font-chakra)] font-semibold text-sm text-[var(--gold)]">
                        {judge.name}
                      </div>
                      <div className="font-[family-name:var(--font-jetbrains)] text-xs text-[var(--arena-text-dim)] uppercase tracking-wider">
                        {judge.expertise}
                      </div>
                    </div>
                  </div>

                  {/* Scores */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1 text-center p-3 arena-panel">
                      <div className="font-[family-name:var(--font-jetbrains)] text-xs text-[var(--pro)] uppercase tracking-wider mb-1">
                        PRO
                      </div>
                      <div className="font-[family-name:var(--font-jetbrains)] text-2xl font-light text-[var(--pro)] score-slam">
                        {judge.scores.pro}
                      </div>
                    </div>
                    <div className="font-[family-name:var(--font-jetbrains)] text-xs text-[var(--arena-text-dim)]">
                      VS
                    </div>
                    <div className="flex-1 text-center p-3 arena-panel">
                      <div className="font-[family-name:var(--font-jetbrains)] text-xs text-[var(--con)] uppercase tracking-wider mb-1">
                        CON
                      </div>
                      <div className="font-[family-name:var(--font-jetbrains)] text-2xl font-light text-[var(--con)] score-slam">
                        {judge.scores.con}
                      </div>
                    </div>
                  </div>

                  {/* Reasoning */}
                  {judge.reasoning && (
                    <div className="pt-3 border-t border-[var(--arena-border)]">
                      <p className="font-[family-name:var(--font-source-serif)] text-xs text-[var(--arena-text-muted)] leading-relaxed italic line-clamp-3">
                        {judge.reasoning}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        ))}
      </div>

      {/* Waiting for judges */}
      {revealedJudges < judges.length && (
        <div className="text-center py-4">
          <div className="flex gap-1.5 justify-center mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] animate-pulse" />
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] animate-pulse delay-75" />
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] animate-pulse delay-150" />
          </div>
          <p className="font-[family-name:var(--font-jetbrains)] text-xs text-[var(--arena-text-dim)] uppercase tracking-widest">
            Judge {revealedJudges + 1} deliberating...
          </p>
        </div>
      )}

      {/* Final Verdict */}
      {showFinalVerdict && winner && (
        <>
          <Confetti
            width={width}
            height={height}
            recycle={false}
            numberOfPieces={400}
            gravity={0.2}
            colors={["#00f0ff", "#ff2d55", "#ffd700", "#22c55e"]}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="arena-panel relative overflow-hidden text-center py-10 sm:py-14 lg:py-16"
          >
            {/* Gold top bar */}
            <div className="absolute top-0 left-0 w-full h-1" style={{ background: "var(--gold)" }} />

            {/* Background glow */}
            <div
              className="absolute inset-0 animate-breathe pointer-events-none"
              style={{
                background: "radial-gradient(circle at center, var(--gold-dim), transparent 70%)",
              }}
            />

            <div className="relative z-10">
              {/* Winner label */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="font-[family-name:var(--font-jetbrains)] text-[0.65rem] uppercase tracking-[0.4em] text-[var(--gold)] mb-4"
              >
                Champion
              </motion.div>

              {/* Winner name */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                className="font-[family-name:var(--font-chakra)] font-bold text-4xl sm:text-5xl lg:text-6xl xl:text-7xl
                         text-gradient-gold mb-6"
              >
                {winner.winner}
              </motion.div>

              {/* Boxing scorecard */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="inline-flex items-center gap-6 sm:gap-10 px-8 py-4 arena-panel"
              >
                <div className="text-center">
                  <div className="font-[family-name:var(--font-jetbrains)] text-xs text-[var(--pro)] uppercase tracking-wider mb-1">
                    {proAgent}
                  </div>
                  <div className="font-[family-name:var(--font-jetbrains)] text-3xl sm:text-4xl font-light text-[var(--pro)]">
                    {winner.proScore.toFixed(1)}
                  </div>
                </div>

                <div className="flex flex-col items-center gap-1">
                  <div className="w-px h-8 bg-[var(--arena-border)]" />
                  <div className="font-[family-name:var(--font-jetbrains)] text-xs text-[var(--arena-text-dim)] uppercase tracking-wider">
                    Final
                  </div>
                  <div className="w-px h-8 bg-[var(--arena-border)]" />
                </div>

                <div className="text-center">
                  <div className="font-[family-name:var(--font-jetbrains)] text-xs text-[var(--con)] uppercase tracking-wider mb-1">
                    {conAgent}
                  </div>
                  <div className="font-[family-name:var(--font-jetbrains)] text-3xl sm:text-4xl font-light text-[var(--con)]">
                    {winner.conScore.toFixed(1)}
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
