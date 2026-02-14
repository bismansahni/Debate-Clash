"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import type { LightningRoundData } from "@/types/debate";

interface LightningRoundSceneProps {
  data?: LightningRoundData;
  proAgent?: string;
  conAgent?: string;
}

export function LightningRoundScene({ data, proAgent = "Pro", conAgent = "Con" }: LightningRoundSceneProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-10 sm:py-16">
        <div className="flex gap-1.5 mb-4">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--pro)] animate-pulse" />
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--arena-text-muted)] animate-pulse delay-75" />
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--con)] animate-pulse delay-150" />
        </div>
        <p className="font-[family-name:var(--font-jetbrains)] text-xs text-[var(--arena-text-dim)] uppercase tracking-widest">
          Lightning round loading...
        </p>
      </div>
    );
  }

  const currentQuestion = data.questions[currentQuestionIndex];
  if (!currentQuestion) return null;
  const proAnswer = data.proAnswers[currentQuestionIndex];
  if (!proAnswer) return null;
  const conAnswer = data.conAnswers[currentQuestionIndex];
  if (!conAnswer) return null;

  const handleNext = () => {
    if (currentQuestionIndex < data.questions.length - 1) {
      setShowAnswer(false);
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setShowAnswer(false);
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <div className="font-[family-name:var(--font-jetbrains)] text-[0.6rem] uppercase tracking-[0.3em] text-[var(--arena-text-dim)] mb-2">
            Phase 05
          </div>
          <h2 className="font-[family-name:var(--font-chakra)] font-bold text-xl sm:text-2xl lg:text-3xl text-[var(--arena-text)]">
            Lightning Round
          </h2>
        </div>

        {/* Counter */}
        <div className="font-[family-name:var(--font-jetbrains)] text-2xl sm:text-3xl font-light text-[var(--arena-text)]">
          {currentQuestionIndex + 1}
          <span className="text-[var(--arena-text-dim)]">/{data.questions.length}</span>
        </div>
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="arena-panel p-5 sm:p-6 lg:p-8 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-[0.125rem]" style={{ background: "var(--gold)" }} />

          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 mb-5 sm:mb-6 border"
            style={{ borderColor: "var(--gold)", background: "var(--gold-dim)" }}
          >
            <span
              className="font-[family-name:var(--font-jetbrains)] text-xs font-bold"
              style={{ color: "var(--gold)" }}
            >
              {currentQuestion.time_limit_seconds}s
            </span>
          </div>

          <h3 className="font-[family-name:var(--font-chakra)] font-bold text-lg sm:text-xl lg:text-2xl text-[var(--arena-text)] leading-tight mb-4">
            {currentQuestion.question}
          </h3>

          {currentQuestion.forces_position && (
            <span
              className="inline-block px-3 py-1 text-[0.55rem] font-[family-name:var(--font-jetbrains)] uppercase tracking-wider border"
              style={{ borderColor: "var(--con)", color: "var(--con)", background: "var(--con-dim)" }}
            >
              Forces Position
            </span>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Reveal / Answers */}
      {!showAnswer ? (
        <div className="text-center py-3 sm:py-4">
          <motion.button
            onClick={() => setShowAnswer(true)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="px-6 sm:px-8 py-2.5 sm:py-3 font-[family-name:var(--font-chakra)] font-semibold
                     text-sm uppercase tracking-[0.2em]
                     text-[var(--arena-text)] border border-[var(--arena-border-active)]
                     hover:border-[var(--gold)] hover:text-[var(--gold)]
                     transition-all duration-300"
          >
            Reveal Answers
          </motion.button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-4"
        >
          {/* Pro Answer — simplified, no avatar */}
          <div className="arena-panel glow-pro overflow-hidden">
            <div className="h-[0.125rem] w-full" style={{ background: "var(--pro)" }} />
            <div className="p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="font-[family-name:var(--font-jetbrains)] text-[0.55rem] uppercase tracking-wider text-[var(--pro)]">
                  {proAgent}
                </span>
                <div className="text-right">
                  <div className="font-[family-name:var(--font-jetbrains)] text-[0.5rem] text-[var(--arena-text-dim)] uppercase tracking-wider">
                    Direct
                  </div>
                  <div className="font-[family-name:var(--font-jetbrains)] text-lg font-light text-[var(--arena-text)]">
                    {proAnswer.directness}
                    <span className="text-[var(--arena-text-dim)] text-xs">/10</span>
                  </div>
                </div>
              </div>
              <p className="font-[family-name:var(--font-source-serif)] text-sm text-[var(--arena-text-muted)] leading-relaxed mb-3">
                {proAnswer.answer}
              </p>
              <div className="flex flex-wrap gap-2">
                {proAnswer.concession_made && (
                  <span
                    className="px-2 py-0.5 text-[0.55rem] font-[family-name:var(--font-jetbrains)] uppercase tracking-wider border"
                    style={{ borderColor: "var(--con)", color: "var(--con)", background: "var(--con-dim)" }}
                  >
                    Concession
                  </span>
                )}
                {proAnswer.directness >= 9 && (
                  <span
                    className="px-2 py-0.5 text-[0.55rem] font-[family-name:var(--font-jetbrains)] uppercase tracking-wider border"
                    style={{ borderColor: "#22c55e", color: "#22c55e", background: "rgba(34,197,94,0.12)" }}
                  >
                    Direct
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Con Answer — simplified, no avatar */}
          <div className="arena-panel glow-con overflow-hidden">
            <div className="h-[0.125rem] w-full" style={{ background: "var(--con)" }} />
            <div className="p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="font-[family-name:var(--font-jetbrains)] text-[0.55rem] uppercase tracking-wider text-[var(--con)]">
                  {conAgent}
                </span>
                <div className="text-right">
                  <div className="font-[family-name:var(--font-jetbrains)] text-[0.5rem] text-[var(--arena-text-dim)] uppercase tracking-wider">
                    Direct
                  </div>
                  <div className="font-[family-name:var(--font-jetbrains)] text-lg font-light text-[var(--arena-text)]">
                    {conAnswer.directness}
                    <span className="text-[var(--arena-text-dim)] text-xs">/10</span>
                  </div>
                </div>
              </div>
              <p className="font-[family-name:var(--font-source-serif)] text-sm text-[var(--arena-text-muted)] leading-relaxed mb-3">
                {conAnswer.answer}
              </p>
              <div className="flex flex-wrap gap-2">
                {conAnswer.concession_made && (
                  <span
                    className="px-2 py-0.5 text-[0.55rem] font-[family-name:var(--font-jetbrains)] uppercase tracking-wider border"
                    style={{ borderColor: "var(--con)", color: "var(--con)", background: "var(--con-dim)" }}
                  >
                    Concession
                  </span>
                )}
                {conAnswer.directness >= 9 && (
                  <span
                    className="px-2 py-0.5 text-[0.55rem] font-[family-name:var(--font-jetbrains)] uppercase tracking-wider border"
                    style={{ borderColor: "#22c55e", color: "#22c55e", background: "rgba(34,197,94,0.12)" }}
                  >
                    Direct
                  </span>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={handlePrev}
          disabled={currentQuestionIndex === 0}
          className="px-4 sm:px-5 py-2 font-[family-name:var(--font-jetbrains)] text-xs uppercase tracking-wider
                   text-[var(--arena-text-muted)] border border-[var(--arena-border)]
                   hover:border-[var(--arena-border-active)] hover:text-[var(--arena-text)]
                   disabled:opacity-20 disabled:cursor-not-allowed transition-all"
        >
          Prev
        </button>

        <div className="flex gap-1.5">
          {data.questions.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentQuestionIndex(idx);
                setShowAnswer(false);
              }}
              className={`w-2 h-2 transition-all ${
                idx === currentQuestionIndex
                  ? "w-6 bg-[var(--arena-text)]"
                  : "bg-[var(--arena-text-dim)] hover:bg-[var(--arena-text-muted)]"
              }`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={currentQuestionIndex === data.questions.length - 1}
          className="px-4 sm:px-5 py-2 font-[family-name:var(--font-jetbrains)] text-xs uppercase tracking-wider
                   text-[var(--arena-text-muted)] border border-[var(--arena-border)]
                   hover:border-[var(--arena-border-active)] hover:text-[var(--arena-text)]
                   disabled:opacity-20 disabled:cursor-not-allowed transition-all"
        >
          Next
        </button>
      </div>

      {/* Concessions summary */}
      {data.concessionsMade.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="arena-panel p-4 sm:p-5 border-l-2"
          style={{ borderLeftColor: "var(--con)" }}
        >
          <div className="font-[family-name:var(--font-jetbrains)] text-[0.6rem] uppercase tracking-wider text-[var(--con)] mb-3">
            Concessions This Round
          </div>
          <ul className="space-y-2">
            {data.concessionsMade.map((concession, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-[var(--con)] text-xs mt-0.5 flex-shrink-0">/</span>
                <span className="font-[family-name:var(--font-source-serif)] text-sm text-[var(--arena-text-muted)] leading-relaxed">
                  {concession}
                </span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </motion.div>
  );
}
