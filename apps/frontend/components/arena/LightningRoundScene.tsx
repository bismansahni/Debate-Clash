// components/arena/LightningRoundScene.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { LightningRoundData } from "@/types/debate";

interface LightningRoundSceneProps {
  data?: LightningRoundData;
  proAgent?: string;
  conAgent?: string;
}

export function LightningRoundScene({
  data,
  proAgent = "Pro",
  conAgent = "Con"
}: LightningRoundSceneProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  if (!data) {
    return (
      <div className="text-center py-8 sm:py-12 text-gray-500">
        <p className="text-sm sm:text-base">Lightning round loading...</p>
      </div>
    );
  }

  const currentQuestion = data.questions[currentQuestionIndex];
  const proAnswer = data.proAnswers[currentQuestionIndex];
  const conAnswer = data.conAnswers[currentQuestionIndex];

  const handleNext = () => {
    if (currentQuestionIndex < data.questions.length - 1) {
      setShowAnswer(false);
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setShowAnswer(false);
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4 sm:space-y-6 lg:space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">
            ⚡ Lightning Round
          </h2>
          <p className="text-xs sm:text-sm text-gray-400">
            Rapid-fire questions. No hedging. No "it depends."
          </p>
        </div>

        {/* Question Counter */}
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-2xl sm:text-3xl lg:text-4xl font-mono font-light">
            {currentQuestionIndex + 1}
            <span className="text-gray-600">/</span>
            {data.questions.length}
          </span>
        </div>
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700
                   rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 text-center"
        >
          {/* Timer Badge */}
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2
                        rounded-full bg-yellow-500/20 border border-yellow-500/30 mb-4 sm:mb-6">
            <span className="text-lg sm:text-xl">⏱️</span>
            <span className="text-xs sm:text-sm font-mono font-semibold text-yellow-400">
              {currentQuestion.time_limit_seconds}s to answer
            </span>
          </div>

          {/* Question */}
          <h3 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold leading-tight mb-4 sm:mb-6">
            {currentQuestion.question}
          </h3>

          {/* Meta */}
          {currentQuestion.forces_position && (
            <div className="inline-block px-3 sm:px-4 py-1.5 rounded-full
                          bg-red-500/20 text-red-400 text-xs sm:text-sm font-semibold">
              🎯 FORCES POSITION
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Answers Grid */}
      {!showAnswer ? (
        <div className="text-center py-6 sm:py-8">
          <button
            onClick={() => setShowAnswer(true)}
            className="px-6 sm:px-8 py-3 sm:py-4 rounded-full bg-white text-black
                     text-sm sm:text-base font-semibold hover:bg-gray-100
                     transition-colors transform hover:scale-105 active:scale-95"
          >
            Reveal Answers
          </button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6"
        >
          {/* Pro Answer */}
          <AnswerCard
            agent={proAgent}
            answer={proAnswer.answer}
            directness={proAnswer.directness}
            concessionMade={proAnswer.concession_made}
            side="pro"
          />

          {/* Con Answer */}
          <AnswerCard
            agent={conAgent}
            answer={conAnswer.answer}
            directness={conAnswer.directness}
            concessionMade={conAnswer.concession_made}
            side="con"
          />
        </motion.div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 sm:pt-6">
        <button
          onClick={handlePrev}
          disabled={currentQuestionIndex === 0}
          className="px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-gray-800 text-white
                   text-sm sm:text-base font-semibold hover:bg-gray-700
                   disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          ← Previous
        </button>

        <div className="flex gap-1.5 sm:gap-2">
          {data.questions.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentQuestionIndex(idx);
                setShowAnswer(false);
              }}
              className={`
                w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all
                ${idx === currentQuestionIndex
                  ? 'bg-white w-6 sm:w-8'
                  : 'bg-gray-600 hover:bg-gray-500'
                }
              `}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={currentQuestionIndex === data.questions.length - 1}
          className="px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-gray-800 text-white
                   text-sm sm:text-base font-semibold hover:bg-gray-700
                   disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          Next →
        </button>
      </div>

      {/* Concessions Summary */}
      {data.concessionsMade.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-red-500/10 border border-red-500/30 rounded-xl sm:rounded-2xl
                   p-4 sm:p-6"
        >
          <h4 className="text-sm sm:text-base font-bold mb-3 sm:mb-4 text-red-400">
            🚨 Concessions Made This Round
          </h4>
          <ul className="space-y-2 text-xs sm:text-sm text-gray-300">
            {data.concessionsMade.map((concession, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-red-400 flex-shrink-0">•</span>
                <span className="leading-relaxed">{concession}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </motion.div>
  );
}

// Answer Card Component
interface AnswerCardProps {
  agent: string;
  answer: string;
  directness: number;
  concessionMade: boolean;
  side: 'pro' | 'con';
}

function AnswerCard({
  agent,
  answer,
  directness,
  concessionMade,
  side
}: AnswerCardProps) {
  const gradientClass = side === 'pro'
    ? 'from-blue-500 to-cyan-500'
    : 'from-purple-500 to-pink-500';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: side === 'pro' ? 0 : 0.1 }}
      className="bg-gray-900 border border-gray-800 rounded-xl sm:rounded-2xl
               overflow-hidden hover:border-gray-700 transition-colors"
    >
      {/* Header */}
      <div className={`bg-gradient-to-r ${gradientClass} p-4 sm:p-6`}>
        <div className="flex items-center justify-between">
          <h4 className="text-base sm:text-lg font-bold text-white">
            {agent}
          </h4>
          <div className="text-right">
            <div className="text-[0.625rem] sm:text-xs text-white/80 mb-0.5">
              Directness
            </div>
            <div className="text-xl sm:text-2xl font-mono font-light text-white">
              {directness}/10
            </div>
          </div>
        </div>
      </div>

      {/* Answer */}
      <div className="p-4 sm:p-6">
        <p className="text-sm sm:text-base text-gray-300 leading-relaxed mb-4">
          {answer}
        </p>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          {concessionMade && (
            <span className="px-2 sm:px-3 py-1 rounded-full text-[0.625rem] sm:text-xs
                           font-semibold bg-red-500/20 text-red-400 border border-red-500/30">
              ⚠️ CONCESSION
            </span>
          )}
          {directness >= 9 && (
            <span className="px-2 sm:px-3 py-1 rounded-full text-[0.625rem] sm:text-xs
                           font-semibold bg-green-500/20 text-green-400 border border-green-500/30">
              ✓ DIRECT
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
