"use client";

import { motion } from "framer-motion";
import { TypewriterText } from "@/components/ui/TypewriterText";
import type { CrossExamRound } from "@/types/debate";

interface CrossExamSceneProps {
  round1?: CrossExamRound;
  proAgent?: string;
  conAgent?: string;
}

export function CrossExamScene({ round1, proAgent = "Pro", conAgent = "Con" }: CrossExamSceneProps) {
  if (!round1) {
    return (
      <div className="flex flex-col items-center justify-center py-10 sm:py-16">
        <div className="flex gap-1.5 mb-4">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--pro)] animate-pulse" />
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--arena-text-muted)] animate-pulse delay-75" />
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--con)] animate-pulse delay-150" />
        </div>
        <p className="font-[family-name:var(--font-jetbrains)] text-xs text-[var(--arena-text-dim)] uppercase tracking-widest">
          Cross-examination in progress...
        </p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div>
        <div className="font-[family-name:var(--font-jetbrains)] text-xs uppercase tracking-[0.3em] text-[var(--arena-text-dim)] mb-2">
          Phase 02
        </div>
        <h2 className="font-[family-name:var(--font-chakra)] font-bold text-2xl sm:text-3xl text-[var(--arena-text)]">
          Cross-Examination
        </h2>
      </div>

      {/* Q&A Exchanges - Rally format */}
      <div className="space-y-4">
        {round1.questions.map((question, idx) => {
          const answer = round1.answers[idx];
          if (!answer) return null;

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="arena-panel overflow-hidden"
            >
              {/* Question */}
              <div
                className="p-4 sm:p-5 border-b border-[var(--arena-border)]"
                style={{ background: "rgba(0, 240, 255, 0.02)" }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="flex-shrink-0 w-7 h-7 rounded-sm flex items-center justify-center border
                               font-[family-name:var(--font-jetbrains)] text-xs font-bold"
                    style={{
                      borderColor: "var(--pro)",
                      color: "var(--pro)",
                      background: "var(--pro-dim)",
                    }}
                  >
                    Q{idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-[family-name:var(--font-jetbrains)] text-xs text-[var(--arena-text-dim)] uppercase tracking-wider mb-2">
                      {round1.questioner} asks:
                    </div>
                    <TypewriterText
                      text={question.question}
                      className="font-[family-name:var(--font-source-serif)] text-sm sm:text-base text-[var(--arena-text)] leading-relaxed"
                    />
                    {/* Meta tags */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span
                        className="px-2 py-0.5 text-xs font-[family-name:var(--font-jetbrains)] uppercase tracking-wider border"
                        style={{
                          borderColor: "var(--con)",
                          color: "var(--con)",
                          background: "var(--con-dim)",
                        }}
                      >
                        {question.intent}
                      </span>
                      <span
                        className="px-2 py-0.5 text-xs font-[family-name:var(--font-jetbrains)] uppercase tracking-wider
                                 text-[var(--arena-text-dim)] border border-[var(--arena-border)]"
                      >
                        Target: {question.target_weakness}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Answer */}
              <div className="p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <div
                    className="flex-shrink-0 w-7 h-7 rounded-sm flex items-center justify-center border
                               font-[family-name:var(--font-jetbrains)] text-xs font-bold"
                    style={{
                      borderColor: "var(--con)",
                      color: "var(--con)",
                      background: "var(--con-dim)",
                    }}
                  >
                    A{idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-[family-name:var(--font-jetbrains)] text-xs text-[var(--arena-text-dim)] uppercase tracking-wider mb-2">
                      {round1.respondent} responds:
                    </div>
                    <TypewriterText
                      text={answer.answer}
                      className="font-[family-name:var(--font-source-serif)] text-sm sm:text-base text-[var(--arena-text)] leading-relaxed"
                    />
                    {/* Strategy tags */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span
                        className="px-2 py-0.5 text-xs font-[family-name:var(--font-jetbrains)] uppercase tracking-wider border"
                        style={{
                          borderColor:
                            answer.strategy === "COUNTER_ATTACK"
                              ? "#22c55e"
                              : answer.strategy === "DEFLECTION"
                                ? "var(--gold)"
                                : "var(--pro)",
                          color:
                            answer.strategy === "COUNTER_ATTACK"
                              ? "#22c55e"
                              : answer.strategy === "DEFLECTION"
                                ? "var(--gold)"
                                : "var(--pro)",
                          background:
                            answer.strategy === "COUNTER_ATTACK"
                              ? "rgba(34, 197, 94, 0.12)"
                              : answer.strategy === "DEFLECTION"
                                ? "var(--gold-dim)"
                                : "var(--pro-dim)",
                        }}
                      >
                        {answer.strategy}
                      </span>
                      {answer.evasion && (
                        <span
                          className="px-2 py-0.5 text-xs font-[family-name:var(--font-jetbrains)] uppercase tracking-wider border"
                          style={{
                            borderColor: "var(--con)",
                            color: "var(--con)",
                            background: "var(--con-dim)",
                          }}
                        >
                          EVASION
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Round Analysis */}
      {round1.analysis && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="arena-panel p-5 sm:p-6"
        >
          <div className="font-[family-name:var(--font-jetbrains)] text-xs uppercase tracking-[0.2em] text-[var(--arena-text-dim)] mb-4">
            Round Analysis
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-5">
            <div className="text-center">
              <div className="font-[family-name:var(--font-jetbrains)] text-xs uppercase tracking-wider text-[var(--arena-text-dim)] mb-1">
                Directness
              </div>
              <div className="font-[family-name:var(--font-jetbrains)] text-2xl font-light text-[var(--arena-text)]">
                {round1.analysis.directness_score}
                <span className="text-[var(--arena-text-dim)] text-sm">/10</span>
              </div>
            </div>
            <div className="text-center">
              <div className="font-[family-name:var(--font-jetbrains)] text-xs uppercase tracking-wider text-[var(--arena-text-dim)] mb-1">
                Concessions
              </div>
              <div className="font-[family-name:var(--font-jetbrains)] text-2xl font-light text-[var(--arena-text)]">
                {round1.analysis.concessions_made.length}
              </div>
            </div>
            <div className="text-center">
              <div className="font-[family-name:var(--font-jetbrains)] text-xs uppercase tracking-wider text-[var(--arena-text-dim)] mb-1">
                Round Winner
              </div>
              <div className="font-[family-name:var(--font-chakra)] font-semibold text-sm text-[#22c55e]">
                {round1.analysis.winner === "questioner"
                  ? round1.questioner
                  : round1.analysis.winner === "respondent"
                    ? round1.respondent
                    : "Tie"}
              </div>
            </div>
          </div>

          {round1.analysis.key_exchange && (
            <div className="pt-4 border-t border-[var(--arena-border)]">
              <div className="font-[family-name:var(--font-jetbrains)] text-xs uppercase tracking-wider text-[var(--gold)] mb-2">
                Key Exchange
              </div>
              <p className="font-[family-name:var(--font-source-serif)] text-sm text-[var(--arena-text-muted)] leading-relaxed">
                {round1.analysis.key_exchange}
              </p>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
