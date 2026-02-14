"use client";

import { motion } from "framer-motion";
import type { Agent, MomentumData } from "@/types/debate";

const JUDGES = [
  { id: "logic", name: "Prof. Ada Lovelace", shortName: "Lovelace", expertise: "Logic" },
  { id: "evidence", name: "Dr. Carl Sagan", shortName: "Sagan", expertise: "Evidence" },
  { id: "rhetoric", name: "Maya Angelou", shortName: "Angelou", expertise: "Rhetoric" },
];

const MODERATOR = {
  name: "Dr. James Rivera",
  shortName: "Rivera",
  initials: "JR",
};

interface CourtroomLayoutProps {
  agents: Agent[];
  currentPhase: string;
  momentum?: MomentumData;
  activeSpeakers: string[];
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function getActiveSpeakers(phase: string): string[] {
  switch (phase) {
    case "pre-show":
    case "preparing":
    case "researching":
      return [];
    case "opening-statements":
      return ["pro", "con"];
    case "cross-examination":
      return ["pro", "con", "moderator"];
    case "rebuttals":
      return ["pro", "con"];
    case "audience-questions":
      return ["pro", "con", "moderator"];
    case "lightning-round":
      return ["pro", "con", "moderator"];
    case "closing-statements":
      return ["pro", "con"];
    case "deliberation":
    case "judging":
      return ["judge-logic", "judge-evidence", "judge-rhetoric"];
    case "verdict":
      return ["judge-logic", "judge-evidence", "judge-rhetoric"];
    default:
      return [];
  }
}

export function CourtroomLayout({ agents, currentPhase, momentum, activeSpeakers }: CourtroomLayoutProps) {
  const proAgents = agents.filter((a) => a.side === "pro");
  const conAgents = agents.filter((a) => a.side === "con");
  const isJudgePhase = ["deliberation", "judging", "verdict"].includes(currentPhase);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative max-w-3xl mx-auto py-5 px-4"
    >
      {/* ── Judge Bench ── */}
      <div className="relative mb-6">
        <div className="text-center mb-2">
          <span className="font-[family-name:var(--font-jetbrains)] text-[0.45rem] sm:text-[0.5rem] uppercase tracking-[0.3em] text-[var(--arena-text-dim)]">
            Judge&apos;s Bench
          </span>
        </div>

        {/* Bench surface */}
        <div
          className={`relative mx-6 sm:mx-12 lg:mx-20 transition-all duration-700 ${
            isJudgePhase ? "courtroom-bench-active" : "courtroom-bench"
          }`}
        >
          {/* Judges row */}
          <div className="flex items-end justify-center gap-6 sm:gap-10 lg:gap-14 py-3 sm:py-4 px-4">
            {JUDGES.map((judge) => {
              const isActive = activeSpeakers.includes(`judge-${judge.id}`);
              return (
                <JudgeSeat
                  key={judge.id}
                  name={judge.name}
                  shortName={judge.shortName}
                  expertise={judge.expertise}
                  isActive={isActive}
                  isJudgePhase={isJudgePhase}
                />
              );
            })}
          </div>

          {/* Bench front edge */}
          <div
            className={`h-px w-full transition-colors duration-700 ${
              isJudgePhase ? "bg-[var(--gold)]" : "bg-[var(--arena-border-active)]"
            }`}
          />
        </div>
      </div>

      {/* ── Debate Floor ── */}
      <div className="relative">
        {/* Center floor ring decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 sm:w-28 sm:h-28 rounded-full courtroom-floor-ring pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-[var(--arena-text-dim)]" />

        {/* Floor layout: Pro | Moderator | Con */}
        <div className="flex items-start justify-between py-2">
          {/* Pro Side */}
          <div className="flex flex-col items-center gap-3 flex-1">
            {proAgents.map((agent) => (
              <AgentSeat key={agent.id} agent={agent} side="pro" isActive={activeSpeakers.includes("pro")} />
            ))}
            {proAgents.length === 0 && <EmptySeat label="PRO" color="var(--pro)" />}
          </div>

          {/* Center Column: Moderator + Table line */}
          <div className="flex flex-col items-center mx-4 sm:mx-8 pt-1">
            <ModeratorSeat isActive={activeSpeakers.includes("moderator")} />

            {/* Visual table divider */}
            <div className="mt-3 flex items-center gap-1.5">
              <div className="w-5 sm:w-8 h-px bg-gradient-to-r from-[var(--pro)] to-transparent opacity-30" />
              <div className="w-1.5 h-1.5 rounded-full border border-[var(--arena-border)] bg-[var(--arena-surface)]" />
              <div className="w-5 sm:w-8 h-px bg-gradient-to-l from-[var(--con)] to-transparent opacity-30" />
            </div>

            {/* Mini momentum tug */}
            {momentum?.currentScore && (
              <div className="mt-2 flex items-center gap-px">
                <motion.div
                  className="h-0.5 rounded-l-full"
                  style={{ background: "var(--pro)" }}
                  animate={{ width: Math.max(4, (momentum.currentScore.pro / 100) * 32) }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                />
                <motion.div
                  className="h-0.5 rounded-r-full"
                  style={{ background: "var(--con)" }}
                  animate={{ width: Math.max(4, (momentum.currentScore.con / 100) * 32) }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            )}
          </div>

          {/* Con Side */}
          <div className="flex flex-col items-center gap-3 flex-1">
            {conAgents.map((agent) => (
              <AgentSeat key={agent.id} agent={agent} side="con" isActive={activeSpeakers.includes("con")} />
            ))}
            {conAgents.length === 0 && <EmptySeat label="CON" color="var(--con)" />}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Sub-components ── */

interface JudgeSeatProps {
  name: string;
  shortName: string;
  expertise: string;
  isActive: boolean;
  isJudgePhase: boolean;
}

function JudgeSeat({ name, shortName, expertise, isActive, isJudgePhase }: JudgeSeatProps) {
  const lit = isActive || isJudgePhase;

  return (
    <div className={`flex flex-col items-center transition-all duration-500 ${lit ? "" : "opacity-35"}`}>
      <div className="relative">
        {/* Speaking glow */}
        {isActive && (
          <motion.div
            className="absolute -inset-1.5 rounded-sm glow-gold"
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        )}

        <div
          className={`relative w-9 h-9 sm:w-11 sm:h-11 rounded-sm flex items-center justify-center border
                     font-[family-name:var(--font-chakra)] font-bold text-[0.6rem] sm:text-xs
                     transition-all duration-500 ${
                       lit
                         ? "border-[var(--gold)] bg-[var(--gold-dim)] text-[var(--gold)]"
                         : "border-[var(--arena-border)] bg-[var(--arena-surface)] text-[var(--arena-text-dim)]"
                     }`}
        >
          {getInitials(name)}
        </div>
      </div>

      <span
        className={`mt-1 font-[family-name:var(--font-jetbrains)] text-[0.45rem] sm:text-[0.5rem]
                   uppercase tracking-wider transition-colors duration-500 ${
                     lit ? "text-[var(--gold)]" : "text-[var(--arena-text-dim)]"
                   }`}
      >
        {shortName}
      </span>
      <span
        className={`font-[family-name:var(--font-jetbrains)] text-[0.35rem] sm:text-[0.4rem] transition-colors duration-500 ${
          lit ? "text-[var(--arena-text-muted)]" : "text-[var(--arena-text-dim)]"
        }`}
      >
        {expertise}
      </span>
    </div>
  );
}

interface AgentSeatProps {
  agent: Agent;
  side: "pro" | "con";
  isActive: boolean;
}

function AgentSeat({ agent, side, isActive }: AgentSeatProps) {
  const sideColor = side === "pro" ? "var(--pro)" : "var(--con)";
  const sideDim = side === "pro" ? "var(--pro-dim)" : "var(--con-dim)";
  const glowClass = side === "pro" ? "glow-pro" : "glow-con";
  const initials = getInitials(agent.persona.name);

  return (
    <div className={`flex flex-col items-center transition-all duration-500 ${isActive ? "" : "opacity-40"}`}>
      <div className="relative">
        {/* Speaking glow ring */}
        {isActive && (
          <motion.div
            className={`absolute -inset-1.5 rounded-sm ${glowClass}`}
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        )}

        <div
          className="relative w-11 h-11 sm:w-14 sm:h-14 rounded-sm flex items-center justify-center border
                     font-[family-name:var(--font-chakra)] font-bold text-xs sm:text-sm
                     transition-all duration-500"
          style={{
            borderColor: isActive ? sideColor : "var(--arena-border)",
            background: isActive ? sideDim : "var(--arena-surface)",
            color: isActive ? sideColor : "var(--arena-text-dim)",
          }}
        >
          {initials}
        </div>
      </div>

      <span
        className="mt-1.5 font-[family-name:var(--font-chakra)] text-[0.55rem] sm:text-[0.65rem] font-semibold
                   truncate max-w-20 text-center transition-colors duration-500"
        style={{ color: isActive ? sideColor : "var(--arena-text-dim)" }}
      >
        {agent.persona.name.split(" ")[0]}
      </span>

      <span
        className="font-[family-name:var(--font-jetbrains)] text-[0.4rem] sm:text-[0.45rem] uppercase tracking-wider
                   transition-colors duration-500"
        style={{ color: isActive ? sideColor : "var(--arena-text-dim)" }}
      >
        {side.toUpperCase()}
      </span>
    </div>
  );
}

interface ModeratorSeatProps {
  isActive: boolean;
}

function ModeratorSeat({ isActive }: ModeratorSeatProps) {
  return (
    <div className={`flex flex-col items-center transition-all duration-500 ${isActive ? "" : "opacity-35"}`}>
      <div className="relative">
        {isActive && (
          <motion.div
            className="absolute -inset-1.5 rounded-sm"
            style={{ boxShadow: "0 0 0.75rem rgba(255,255,255,0.15)" }}
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        )}

        <div
          className={`relative w-8 h-8 sm:w-10 sm:h-10 rounded-sm flex items-center justify-center border
                     font-[family-name:var(--font-chakra)] font-bold text-[0.55rem] sm:text-xs
                     transition-all duration-500 ${
                       isActive
                         ? "border-[var(--arena-border-active)] bg-[var(--arena-surface-hover)] text-[var(--arena-text)]"
                         : "border-[var(--arena-border)] bg-[var(--arena-surface)] text-[var(--arena-text-dim)]"
                     }`}
        >
          {MODERATOR.initials}
        </div>
      </div>

      <span
        className={`mt-1 font-[family-name:var(--font-jetbrains)] text-[0.45rem] uppercase tracking-wider
                   transition-colors duration-500 ${
                     isActive ? "text-[var(--arena-text)]" : "text-[var(--arena-text-dim)]"
                   }`}
      >
        {MODERATOR.shortName}
      </span>
      <span
        className={`font-[family-name:var(--font-jetbrains)] text-[0.35rem] sm:text-[0.4rem] transition-colors duration-500 ${
          isActive ? "text-[var(--arena-text-muted)]" : "text-[var(--arena-text-dim)]"
        }`}
      >
        Moderator
      </span>
    </div>
  );
}

function EmptySeat({ label, color }: { label: string; color: string }) {
  return (
    <div className="flex flex-col items-center opacity-20">
      <div
        className="w-11 h-11 sm:w-14 sm:h-14 rounded-sm flex items-center justify-center border border-dashed
                   font-[family-name:var(--font-jetbrains)] text-[0.5rem]"
        style={{ borderColor: color, color }}
      >
        ?
      </div>
      <span
        className="mt-1.5 font-[family-name:var(--font-jetbrains)] text-[0.45rem] uppercase tracking-wider"
        style={{ color }}
      >
        {label}
      </span>
    </div>
  );
}
