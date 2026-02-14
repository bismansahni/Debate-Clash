// components/arena/PreShowScene.tsx
"use client";

import { motion } from "framer-motion";
import { PreShowData, Agent } from "@/types/debate";

interface PreShowSceneProps {
  data?: PreShowData;
  agents?: Agent[];
  topic: string;
}

export function PreShowScene({ data, agents = [], topic }: PreShowSceneProps) {
  if (!data) {
    return (
      <div className="text-center py-8 sm:py-12 text-gray-500">
        <p className="text-sm sm:text-base">Generating pre-show hype...</p>
      </div>
    );
  }

  const proAgent = agents.find(a =>
    a.stance.toLowerCase().includes('pro') ||
    a.stance.toLowerCase().includes('for') ||
    a.stance.toLowerCase().includes('support')
  );

  const conAgent = agents.find(a =>
    a.stance.toLowerCase().includes('con') ||
    a.stance.toLowerCase().includes('against') ||
    a.stance.toLowerCase().includes('oppos')
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 sm:space-y-8 lg:space-y-12"
    >
      {/* Cinematic Title */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center py-8 sm:py-12 lg:py-16"
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
          className="mb-4 sm:mb-6"
        >
          <span className="inline-block px-4 sm:px-6 py-2 sm:py-3 rounded-full
                         bg-gradient-to-r from-blue-500/20 to-purple-500/20
                         border border-blue-500/30 text-blue-400
                         text-xs sm:text-sm font-semibold uppercase tracking-wider">
            Tonight's Debate
          </span>
        </motion.div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold
                     leading-tight mb-4 sm:mb-6 px-4">
          {topic}
        </h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-2 sm:gap-3 text-gray-500"
        >
          <div className="w-12 sm:w-16 h-px bg-gradient-to-r from-transparent to-gray-700" />
          <span className="text-xs sm:text-sm font-mono uppercase tracking-wide">
            Live Combat
          </span>
          <div className="w-12 sm:w-16 h-px bg-gradient-to-l from-transparent to-gray-700" />
        </motion.div>
      </motion.div>

      {/* Context, Stakes, Predictions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-gray-900 border border-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8"
      >
        <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full
                        bg-blue-500/20 flex items-center justify-center">
            <span className="text-base sm:text-lg">📋</span>
          </div>
          <div className="flex-1">
            <h3 className="text-base sm:text-lg font-bold mb-2">
              Why This Matters
            </h3>
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
              {data.context}
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="bg-gray-900 border border-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8"
      >
        <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full
                        bg-red-500/20 flex items-center justify-center">
            <span className="text-base sm:text-lg">⚠️</span>
          </div>
          <div className="flex-1">
            <h3 className="text-base sm:text-lg font-bold mb-2">
              What's at Stake
            </h3>
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
              {data.stakes}
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="bg-gradient-to-br from-purple-900/20 to-gray-900
                 border border-purple-500/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8"
      >
        <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full
                        bg-purple-500/20 flex items-center justify-center">
            <span className="text-base sm:text-lg">🔮</span>
          </div>
          <div className="flex-1">
            <h3 className="text-base sm:text-lg font-bold mb-2 text-purple-400">
              AI Prediction
            </h3>
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
              {data.predictions}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
