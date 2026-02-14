// components/arena/OpeningStatementsScene.tsx
"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { TypewriterText } from "@/components/ui/TypewriterText";

interface OpeningStatementsSceneProps {
  proStatement?: any;
  conStatement?: any;
  proAgent?: string;
  conAgent?: string;
}

export function OpeningStatementsScene({
  proStatement,
  conStatement,
  proAgent = "Pro",
  conAgent = "Con"
}: OpeningStatementsSceneProps) {
  const [activeAgent, setActiveAgent] = useState<'pro' | 'con'>('pro');

  if (!proStatement && !conStatement) {
    return (
      <div className="text-center py-8 sm:py-12 text-gray-500">
        <p className="text-sm sm:text-base">Opening statements loading...</p>
      </div>
    );
  }

  const currentStatement = activeAgent === 'pro' ? proStatement : conStatement;
  const currentAgent = activeAgent === 'pro' ? proAgent : conAgent;

  const getStatementText = (statement: any): string => {
    if (typeof statement === 'string') return statement;
    if (statement?.mainPoints) return statement.mainPoints.join('\n\n');
    if (statement?.opening?.text) return statement.opening.text;
    return JSON.stringify(statement);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 sm:space-y-8"
    >
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
          🎤 Opening Statements
        </h2>
        <p className="text-xs sm:text-sm text-gray-400">
          First impressions matter
        </p>
      </div>

      <div className="flex justify-center">
        <div className="inline-flex gap-2 p-1.5 bg-gray-900 border border-gray-800 rounded-full">
          <button
            onClick={() => setActiveAgent('pro')}
            className={`
              px-4 sm:px-6 py-2 sm:py-3 rounded-full text-sm sm:text-base font-semibold transition-all
              ${activeAgent === 'pro' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg' : 'text-gray-400 hover:text-gray-300'}
            `}
          >
            {proAgent}
          </button>
          <button
            onClick={() => setActiveAgent('con')}
            className={`
              px-4 sm:px-6 py-2 sm:py-3 rounded-full text-sm sm:text-base font-semibold transition-all
              ${activeAgent === 'con' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' : 'text-gray-400 hover:text-gray-300'}
            `}
          >
            {conAgent}
          </button>
        </div>
      </div>

      <motion.div
        key={activeAgent}
        initial={{ opacity: 0, x: activeAgent === 'pro' ? -20 : 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-gray-900 border border-gray-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12"
      >
        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-gray-800">
          <div className={`flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br ${activeAgent === 'pro' ? 'from-blue-500 to-cyan-500' : 'from-purple-500 to-pink-500'} flex items-center justify-center text-white text-lg sm:text-2xl font-bold`}>
            {currentAgent.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold">{currentAgent}</h3>
            <p className="text-xs sm:text-sm text-gray-400">Opening Statement</p>
          </div>
        </div>
        <div className="prose prose-invert max-w-none">
          <TypewriterText
            text={getStatementText(currentStatement)}
            speed={15}
            className="text-base sm:text-lg lg:text-xl text-gray-200 leading-relaxed whitespace-pre-line"
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
