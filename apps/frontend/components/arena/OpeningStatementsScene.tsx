"use client";

import { motion } from "framer-motion";
import { TypewriterText } from "@/components/ui/TypewriterText";

interface OpeningStatementsSceneProps {
  proStatement?: any;
  conStatement?: any;
  proAgent?: string;
  conAgent?: string;
}

function getStatementText(statement: any): string {
  if (typeof statement === "string") return statement;
  if (statement?.mainPoints) return statement.mainPoints.join("\n\n");
  if (statement?.opening?.text) return statement.opening.text;
  return JSON.stringify(statement);
}

export function OpeningStatementsScene({
  proStatement,
  conStatement,
  proAgent = "Pro",
  conAgent = "Con",
}: OpeningStatementsSceneProps) {
  if (!proStatement && !conStatement) {
    return (
      <div className="flex flex-col items-center justify-center py-10 sm:py-16">
        <div className="flex gap-1.5 mb-4">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--pro)] animate-pulse" />
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--arena-text-muted)] animate-pulse delay-75" />
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--con)] animate-pulse delay-150" />
        </div>
        <p className="font-[family-name:var(--font-jetbrains)] text-xs text-[var(--arena-text-dim)] uppercase tracking-widest">
          Opening statements loading...
        </p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 sm:space-y-6">
      {/* Phase Header */}
      <div className="text-center">
        <div className="font-[family-name:var(--font-jetbrains)] text-[0.6rem] uppercase tracking-[0.3em] text-[var(--arena-text-dim)] mb-2">
          Phase 01
        </div>
        <h2 className="font-[family-name:var(--font-chakra)] font-bold text-xl sm:text-2xl lg:text-3xl text-[var(--arena-text)]">
          Opening Statements
        </h2>
      </div>

      {/* Both statements — no tabs */}
      <div className="space-y-4">
        {proStatement && (
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="arena-panel glow-pro overflow-hidden"
          >
            <div className="h-[0.125rem] w-full" style={{ background: "var(--pro)" }} />
            <div className="p-4 sm:p-5 lg:p-6">
              <div className="font-[family-name:var(--font-jetbrains)] text-[0.55rem] uppercase tracking-wider mb-3 text-[var(--pro)]">
                {proAgent} &mdash; Opening Statement
              </div>
              <TypewriterText
                text={getStatementText(proStatement)}
                speed={12}
                className="font-[family-name:var(--font-source-serif)] text-sm sm:text-base lg:text-lg
                         text-[var(--arena-text-muted)] leading-relaxed whitespace-pre-line"
              />
            </div>
          </motion.div>
        )}

        {conStatement && (
          <motion.div
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="arena-panel glow-con overflow-hidden"
          >
            <div className="h-[0.125rem] w-full" style={{ background: "var(--con)" }} />
            <div className="p-4 sm:p-5 lg:p-6">
              <div className="font-[family-name:var(--font-jetbrains)] text-[0.55rem] uppercase tracking-wider mb-3 text-[var(--con)]">
                {conAgent} &mdash; Opening Statement
              </div>
              <TypewriterText
                text={getStatementText(conStatement)}
                speed={12}
                className="font-[family-name:var(--font-source-serif)] text-sm sm:text-base lg:text-lg
                         text-[var(--arena-text-muted)] leading-relaxed whitespace-pre-line"
              />
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
