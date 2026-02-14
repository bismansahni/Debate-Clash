// components/arena/VerdictScene.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
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
    breakdown: {
      logic: number;
      evidence: number;
      rhetoric: number;
    };
  };
  proAgent?: string;
  conAgent?: string;
}

export function VerdictScene({
  judges = [],
  winner,
  proAgent = "Pro",
  conAgent = "Con"
}: VerdictSceneProps) {
  const [revealedJudges, setRevealedJudges] = useState(0);
  const [showFinalVerdict, setShowFinalVerdict] = useState(false);
  const { width, height } = useWindowSize();

  useEffect(() => {
    if (revealedJudges < judges.length) {
      const timer = setTimeout(() => {
        setRevealedJudges(prev => prev + 1);
      }, 2000);
      return () => clearTimeout(timer);
    } else if (revealedJudges === judges.length && !showFinalVerdict) {
      const timer = setTimeout(() => {
        setShowFinalVerdict(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [revealedJudges, judges.length, showFinalVerdict]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 sm:space-y-8 lg:space-y-12"
    >
      <div className="text-center">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3">
          🏆 Final Verdict
        </h2>
        <p className="text-sm sm:text-base text-gray-400">
          Three judges. Three verdicts. One winner.
        </p>
      </div>

      {showFinalVerdict && winner && (
        <>
          <Confetti width={width} height={height} recycle={false} numberOfPieces={500} gravity={0.3} />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="bg-gradient-to-br from-gray-900 via-green-900/20 to-gray-900
                     border-2 border-green-500/50 rounded-2xl sm:rounded-3xl
                     p-8 sm:p-12 lg:p-16 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-green-500/5 animate-pulse" />
            <div className="relative">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="text-6xl sm:text-7xl lg:text-8xl mb-4 sm:mb-6"
              >
                🏆
              </motion.div>
              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 text-green-400"
              >
                WINNER
              </motion.h3>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-3 sm:mb-4"
              >
                {winner.winner}
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-3xl sm:text-4xl lg:text-5xl font-mono font-light text-gray-300 mb-6 sm:mb-8"
              >
                {winner.totalScore.toFixed(1)} points
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
