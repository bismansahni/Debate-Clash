// components/arena/MomentumBar.tsx
"use client";

import { motion } from "framer-motion";

interface MomentumBarProps {
  proMomentum: number;  // 0-100
  conMomentum: number;  // 0-100
  proAgent: string;
  conAgent: string;
}

export function MomentumBar({
  proMomentum,
  conMomentum,
  proAgent,
  conAgent
}: MomentumBarProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-xs sm:text-sm font-semibold text-gray-400 uppercase tracking-wide">
          Live Momentum
        </h3>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[0.625rem] sm:text-xs text-gray-500 font-mono">LIVE</span>
        </div>
      </div>

      {/* Agent Names + Percentages */}
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <div className="flex-1 text-left">
          <div className="text-xs sm:text-sm text-gray-400 mb-1 truncate">
            {proAgent}
          </div>
          <div className="text-xl sm:text-2xl lg:text-3xl font-mono font-light">
            {proMomentum}%
          </div>
        </div>

        <div className="px-2 sm:px-4 text-center">
          <div className="text-[0.625rem] sm:text-xs text-gray-600 font-semibold">VS</div>
        </div>

        <div className="flex-1 text-right">
          <div className="text-xs sm:text-sm text-gray-400 mb-1 truncate">
            {conAgent}
          </div>
          <div className="text-xl sm:text-2xl lg:text-3xl font-mono font-light">
            {conMomentum}%
          </div>
        </div>
      </div>

      {/* Momentum Bar */}
      <div className="relative h-2 sm:h-3 bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
          initial={{ width: '50%' }}
          animate={{ width: `${proMomentum}%` }}
          transition={{
            duration: 0.5,
            ease: [0.16, 1, 0.3, 1]
          }}
        />
      </div>

      {/* Momentum Difference Indicator */}
      <div className="mt-2 sm:mt-3 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-[0.625rem] sm:text-xs text-gray-500 font-mono"
        >
          {Math.abs(proMomentum - conMomentum) > 10 && (
            <span className={
              proMomentum > conMomentum
                ? 'text-blue-400'
                : 'text-purple-400'
            }>
              {proMomentum > conMomentum ? '↑' : '↓'}
              {' '}{Math.abs(proMomentum - conMomentum)} point lead
            </span>
          )}
        </motion.div>
      </div>
    </div>
  );
}
