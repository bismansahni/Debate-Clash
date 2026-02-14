"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface AudiencePersona {
  name: string;
  age?: number;
  perspective: string;
  bias: string;
}

interface AudienceQuestion {
  persona: AudiencePersona;
  question: string;
  challenges: string;
  forces_specificity: boolean;
}

interface AudienceResponse {
  question: string;
  persona: string;
  answer: string;
}

interface AudienceQuestionSceneProps {
  questions?: AudienceQuestion[];
  proResponses?: AudienceResponse[];
  conResponses?: AudienceResponse[];
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

export function AudienceQuestionScene({
  questions = [],
  proResponses = [],
  conResponses = [],
  proAgent = "Pro",
  conAgent = "Con",
}: AudienceQuestionSceneProps) {
  const [selectedQuestion, setSelectedQuestion] = useState(0);

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 sm:py-16">
        <div className="flex gap-1.5 mb-4">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--pro)] animate-pulse" />
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--arena-text-muted)] animate-pulse delay-75" />
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--con)] animate-pulse delay-150" />
        </div>
        <p className="font-[family-name:var(--font-jetbrains)] text-xs text-[var(--arena-text-dim)] uppercase tracking-widest">
          Audience questions loading...
        </p>
      </div>
    );
  }

  const currentQuestion = questions[selectedQuestion];
  if (!currentQuestion) return null;
  const proAnswer = proResponses[selectedQuestion];
  const conAnswer = conResponses[selectedQuestion];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 sm:space-y-6">
      {/* Header + selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <div className="font-[family-name:var(--font-jetbrains)] text-[0.6rem] uppercase tracking-[0.3em] text-[var(--arena-text-dim)] mb-2">
            Phase 04
          </div>
          <h2 className="font-[family-name:var(--font-chakra)] font-bold text-xl sm:text-2xl lg:text-3xl text-[var(--arena-text)]">
            Audience Questions
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {questions.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedQuestion(idx)}
              className={`w-8 h-8 flex items-center justify-center
                         font-[family-name:var(--font-jetbrains)] text-xs font-bold
                         border transition-all duration-300
                ${
                  selectedQuestion === idx
                    ? "text-[var(--arena-text)] border-[var(--arena-border-active)] bg-[var(--arena-surface-hover)]"
                    : "text-[var(--arena-text-dim)] border-[var(--arena-border)] hover:text-[var(--arena-text-muted)]"
                }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Question Card — audience persona stays (not a debater) */}
      <motion.div
        key={selectedQuestion}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="arena-panel glow-gold p-4 sm:p-5 lg:p-6"
      >
        <div className="flex items-start gap-3 mb-4">
          <div
            className="flex-shrink-0 w-10 h-10 rounded-sm flex items-center justify-center border
                       font-[family-name:var(--font-chakra)] font-bold text-xs"
            style={{
              borderColor: "var(--gold)",
              background: "var(--gold-dim)",
              color: "var(--gold)",
            }}
          >
            {getInitials(currentQuestion.persona.name)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-[family-name:var(--font-chakra)] font-semibold text-sm text-[var(--gold)]">
                {currentQuestion.persona.name}
              </span>
              {currentQuestion.persona.age && (
                <span className="font-[family-name:var(--font-jetbrains)] text-[0.55rem] text-[var(--arena-text-dim)]">
                  {currentQuestion.persona.age}
                </span>
              )}
            </div>
            <div className="font-[family-name:var(--font-jetbrains)] text-[0.55rem] text-[var(--arena-text-dim)] uppercase tracking-wider">
              {currentQuestion.persona.perspective}
            </div>
          </div>
        </div>

        <p className="font-[family-name:var(--font-source-serif)] text-base sm:text-lg lg:text-xl text-[var(--arena-text)] leading-relaxed italic">
          &ldquo;{currentQuestion.question}&rdquo;
        </p>

        {currentQuestion.forces_specificity && (
          <div className="mt-3">
            <span
              className="px-2 py-0.5 text-[0.55rem] font-[family-name:var(--font-jetbrains)] uppercase tracking-wider border"
              style={{
                borderColor: "var(--con)",
                color: "var(--con)",
                background: "var(--con-dim)",
              }}
            >
              Forces Specificity
            </span>
          </div>
        )}
      </motion.div>

      {/* Responses — simplified, no avatar headers (courtroom shows identity) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {proAnswer && (
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="arena-panel glow-pro overflow-hidden"
          >
            <div className="h-[0.125rem] w-full" style={{ background: "var(--pro)" }} />
            <div className="p-4 sm:p-5">
              <div className="font-[family-name:var(--font-jetbrains)] text-[0.55rem] uppercase tracking-wider mb-2 text-[var(--pro)]">
                {proAgent}
              </div>
              <p className="font-[family-name:var(--font-source-serif)] text-sm text-[var(--arena-text-muted)] leading-relaxed">
                {proAnswer.answer}
              </p>
            </div>
          </motion.div>
        )}

        {conAnswer && (
          <motion.div
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="arena-panel glow-con overflow-hidden"
          >
            <div className="h-[0.125rem] w-full" style={{ background: "var(--con)" }} />
            <div className="p-4 sm:p-5">
              <div className="font-[family-name:var(--font-jetbrains)] text-[0.55rem] uppercase tracking-wider mb-2 text-[var(--con)]">
                {conAgent}
              </div>
              <p className="font-[family-name:var(--font-source-serif)] text-sm text-[var(--arena-text-muted)] leading-relaxed">
                {conAnswer.answer}
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
