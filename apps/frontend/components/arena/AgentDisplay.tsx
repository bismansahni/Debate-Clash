"use client";

import { motion } from "framer-motion";
import type { Agent } from "@/types/debate";

interface AgentDisplayProps {
  agent: Agent;
  side: "pro" | "con";
  index: number;
}

export function AgentDisplay({ agent, side, index }: AgentDisplayProps) {
  const initials = agent.persona.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const sideColor = side === "pro" ? "var(--pro)" : "var(--con)";
  const sideDim = side === "pro" ? "var(--pro-dim)" : "var(--con-dim)";
  const glowClass = side === "pro" ? "glow-pro" : "glow-con";
  const textGradient = side === "pro" ? "text-gradient-pro" : "text-gradient-con";

  return (
    <motion.div
      initial={{ opacity: 0, x: side === "pro" ? -30 : 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.15, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`arena-panel ${glowClass} p-5 sm:p-6 relative overflow-hidden`}
    >
      {/* Side indicator bar */}
      <div className="absolute top-0 left-0 w-full h-0.5" style={{ background: sideColor }} />

      {/* Header: Avatar + Name */}
      <div className="flex items-start gap-4 mb-5">
        {/* Avatar */}
        <div
          className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-sm
                     flex items-center justify-center
                     font-[family-name:var(--font-chakra)] font-bold
                     text-lg sm:text-xl border"
          style={{
            background: sideDim,
            borderColor: sideColor,
            color: sideColor,
          }}
        >
          {initials}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3
              className={`font-[family-name:var(--font-chakra)] font-bold text-lg sm:text-xl ${textGradient} truncate`}
            >
              {agent.persona.name}
            </h3>
          </div>
          <div
            className="font-[family-name:var(--font-jetbrains)] text-[0.6rem] uppercase tracking-[0.2em] mb-2"
            style={{ color: sideColor }}
          >
            {side === "pro" ? "PRO" : "CON"} AGENT
          </div>
          <p className="font-[family-name:var(--font-source-serif)] text-sm text-[var(--arena-text-muted)] line-clamp-2 italic">
            {agent.stance}
          </p>
        </div>
      </div>

      {/* Background */}
      <p className="font-[family-name:var(--font-source-serif)] text-sm text-[var(--arena-text-muted)] leading-relaxed mb-5 line-clamp-3">
        {agent.persona.background}
      </p>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="arena-panel p-3">
          <div className="font-[family-name:var(--font-jetbrains)] text-[0.55rem] uppercase tracking-wider text-[var(--arena-text-dim)] mb-1">
            Style
          </div>
          <div className="font-[family-name:var(--font-chakra)] text-xs font-medium text-[var(--arena-text)] truncate">
            {agent.persona.traits.speaking_style.split(",")[0]}
          </div>
        </div>
        <div className="arena-panel p-3">
          <div className="font-[family-name:var(--font-jetbrains)] text-[0.55rem] uppercase tracking-wider text-[var(--arena-text-dim)] mb-1">
            Rhetoric
          </div>
          <div className="font-[family-name:var(--font-chakra)] text-xs font-medium text-[var(--arena-text)] truncate">
            {agent.persona.traits.rhetoric_preference.split(",")[0]}
          </div>
        </div>
      </div>

      {/* Catchphrase */}
      {agent.persona.traits.catchphrases && agent.persona.traits.catchphrases.length > 0 && (
        <div className="mt-4 pt-4 border-t border-[var(--arena-border)]">
          <div className="font-[family-name:var(--font-jetbrains)] text-[0.55rem] uppercase tracking-wider text-[var(--arena-text-dim)] mb-1.5">
            Signature
          </div>
          <p className="font-[family-name:var(--font-source-serif)] text-sm text-[var(--arena-text-muted)] italic">
            &ldquo;{agent.persona.traits.catchphrases[0]}&rdquo;
          </p>
        </div>
      )}
    </motion.div>
  );
}
