// components/arena/CrossExamScene.tsx
"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { CrossExamRound, Agent } from "@/types/debate";
import { TypewriterText } from "@/components/ui/TypewriterText";

interface CrossExamSceneProps {
  round1?: CrossExamRound;
  round2?: CrossExamRound;
  proAgent?: Agent;
  conAgent?: Agent;
}

export function CrossExamScene({
  round1,
  round2,
  proAgent,
  conAgent
}: CrossExamSceneProps) {
  const [selectedRound, setSelectedRound] = useState<1 | 2>(1);
  const currentRound = selectedRound === 1 ? round1 : round2;

  if (!currentRound) {
    return (
      <div className="text-center py-8 sm:py-12 text-gray-500">
        <p className="text-sm sm:text-base">Cross-examination in progress...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 sm:space-y-6"
    >
      {/* Round Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold">
          ⚔️ Cross-Examination
        </h2>

        <div className="flex gap-2">
          <button
            onClick={() => setSelectedRound(1)}
            className={`
              px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold
              transition-all
              ${selectedRound === 1
                ? 'bg-white text-black'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }
            `}
          >
            Round 1
          </button>
          <button
            onClick={() => setSelectedRound(2)}
            className={`
              px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold
              transition-all
              ${selectedRound === 2
                ? 'bg-white text-black'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }
            `}
            disabled={!round2}
          >
            Round 2
          </button>
        </div>
      </div>

      {/* Q&A Exchanges */}
      <div className="space-y-4 sm:space-y-6">
        {currentRound.questions.map((question, idx) => {
          const answer = currentRound.answers[idx];

          return (
            <div
              key={idx}
              className="bg-gray-900 border border-gray-800 rounded-xl sm:rounded-2xl overflow-hidden"
            >
              {/* Question */}
              <div className="p-4 sm:p-6 lg:p-8 bg-gray-800/30">
                <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full
                                bg-gradient-to-br from-blue-500 to-cyan-500
                                flex items-center justify-center text-white text-xs sm:text-sm font-bold">
                    Q{idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2">
                      {currentRound.questioner} asks:
                    </div>
                    <TypewriterText
                      text={question.question}
                      className="text-sm sm:text-base lg:text-lg text-white leading-relaxed"
                    />
                  </div>
                </div>

                {/* Question metadata */}
                <div className="flex flex-wrap gap-2 mt-3 sm:mt-4">
                  <span className="px-2 sm:px-3 py-1 rounded-full text-[0.625rem] sm:text-xs font-semibold
                                 bg-red-500/20 text-red-400 border border-red-500/30">
                    {question.intent}
                  </span>
                  <span className="px-2 sm:px-3 py-1 rounded-full text-[0.625rem] sm:text-xs
                                 bg-gray-700/50 text-gray-300">
                    Target: {question.target_weakness}
                  </span>
                </div>
              </div>

              {/* Answer */}
              <div className="p-4 sm:p-6 lg:p-8">
                <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full
                                bg-gradient-to-br from-purple-500 to-pink-500
                                flex items-center justify-center text-white text-xs sm:text-sm font-bold">
                    A{idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2">
                      {currentRound.respondent} responds:
                    </div>
                    <TypewriterText
                      text={answer.answer}
                      className="text-sm sm:text-base lg:text-lg text-white leading-relaxed"
                    />
                  </div>
                </div>

                {/* Answer metadata */}
                <div className="flex flex-wrap gap-2 mt-3 sm:mt-4">
                  <span className={`
                    px-2 sm:px-3 py-1 rounded-full text-[0.625rem] sm:text-xs font-semibold
                    ${answer.strategy === 'COUNTER_ATTACK'
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : answer.strategy === 'DEFLECTION'
                      ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    }
                  `}>
                    {answer.strategy}
                  </span>
                  {answer.evasion && (
                    <span className="px-2 sm:px-3 py-1 rounded-full text-[0.625rem] sm:text-xs font-semibold
                                   bg-red-500/20 text-red-400 border border-red-500/30">
                      ⚠️ EVASION
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Round Analysis */}
      {currentRound.analysis && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700
                   rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8"
        >
          <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">
            📊 Round Analysis
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
            {/* Directness Score */}
            <div>
              <div className="text-xs sm:text-sm text-gray-400 mb-1.5 sm:mb-2">
                Directness
              </div>
              <div className="text-2xl sm:text-3xl lg:text-4xl font-mono font-light">
                {currentRound.analysis.directness_score}/10
              </div>
            </div>

            {/* Concessions */}
            <div>
              <div className="text-xs sm:text-sm text-gray-400 mb-1.5 sm:mb-2">
                Concessions
              </div>
              <div className="text-2xl sm:text-3xl lg:text-4xl font-mono font-light">
                {currentRound.analysis.concessions_made.length}
              </div>
            </div>

            {/* Winner */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="text-xs sm:text-sm text-gray-400 mb-1.5 sm:mb-2">
                Round Winner
              </div>
              <div className="text-base sm:text-lg lg:text-xl font-bold text-green-400">
                {currentRound.analysis.winner === 'questioner'
                  ? currentRound.questioner
                  : currentRound.analysis.winner === 'respondent'
                  ? currentRound.respondent
                  : 'Tie'}
              </div>
            </div>
          </div>

          {/* Key Exchange */}
          {currentRound.analysis.key_exchange && (
            <div className="pt-3 sm:pt-4 border-t border-gray-700">
              <div className="text-xs sm:text-sm text-gray-400 mb-2">
                🔥 Key Exchange
              </div>
              <p className="text-xs sm:text-sm lg:text-base text-gray-300 leading-relaxed">
                {currentRound.analysis.key_exchange}
              </p>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
