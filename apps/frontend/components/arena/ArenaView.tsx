// components/arena/ArenaView.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { DebateData } from "@/types/debate";
import { AgentDisplay } from "./AgentDisplay";
import { MomentumBar } from "./MomentumBar";
import { PhaseTimeline } from "./PhaseTimeline";
import { PreShowScene } from "./PreShowScene";
import { OpeningStatementsScene } from "./OpeningStatementsScene";
import { CrossExamScene } from "./CrossExamScene";
import { RebuttalsScene } from "./RebuttalsScene";
import { AudienceQuestionScene } from "./AudienceQuestionScene";
import { LightningRoundScene } from "./LightningRoundScene";
import { VerdictScene } from "./VerdictScene";
import { LiveStats } from "./LiveStats";

interface ArenaViewProps {
  debate: DebateData;
}

function renderPhaseContent(phase: string, debate: DebateData, proAgent: any, conAgent: any) {
  const key = `phase-${phase}`;

  switch (phase) {
    case 'pre-show':
    case 'preparing':
    case 'researching':
      return (
        <motion.div key={key} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6 sm:space-y-8">
          {/* Full Agent Personas - Only in Pre-Show */}
          {proAgent && conAgent && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
              <AgentDisplay agent={proAgent} side="pro" index={0} />
              <AgentDisplay agent={conAgent} side="con" index={1} />
            </div>
          )}

          {/* Pre-Show Content */}
          <PreShowScene
            data={debate.phases?.preShow}
            agents={debate.agents}
            topic={debate.topic}
          />
        </motion.div>
      );

    case 'opening-statements':
      return (
        <motion.div key={key} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <OpeningStatementsScene
            proStatement={debate.phases?.openingStatements?.proStatement}
            conStatement={debate.phases?.openingStatements?.conStatement}
            proAgent={proAgent?.persona?.name}
            conAgent={conAgent?.persona?.name}
          />
        </motion.div>
      );

    case 'cross-examination':
      return (
        <motion.div key={key} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <CrossExamScene
            round1={debate.phases?.crossExamination?.round1}
            round2={debate.phases?.crossExamination?.round2}
            proAgent={proAgent?.persona?.name}
            conAgent={conAgent?.persona?.name}
          />
        </motion.div>
      );

    case 'rebuttals':
      return (
        <motion.div key={key} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <RebuttalsScene
            proRebuttal={debate.phases?.rebuttals?.proRebuttal}
            conRebuttal={debate.phases?.rebuttals?.conRebuttal}
            proAgent={proAgent?.persona?.name}
            conAgent={conAgent?.persona?.name}
          />
        </motion.div>
      );

    case 'audience-questions':
      return (
        <motion.div key={key} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <AudienceQuestionScene
            questions={debate.phases?.audienceQuestions?.questions}
            proResponses={debate.phases?.audienceQuestions?.proResponses}
            conResponses={debate.phases?.audienceQuestions?.conResponses}
            proAgent={proAgent?.persona?.name}
            conAgent={conAgent?.persona?.name}
          />
        </motion.div>
      );

    case 'lightning-round':
      return (
        <motion.div key={key} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <LightningRoundScene
            data={debate.phases?.lightningRound}
            proAgent={proAgent?.persona?.name}
            conAgent={conAgent?.persona?.name}
          />
        </motion.div>
      );

    case 'verdict':
    case 'judging':
    case 'deliberation': {
      // Transform store format to component format
      const verdictData = debate.phases?.verdict;
      const judges = verdictData ? [
        verdictData.logicScore && { name: 'Logic Judge', expertise: 'Logical Reasoning', scores: verdictData.logicScore.scores, reasoning: verdictData.logicScore.reasoning },
        verdictData.evidenceScore && { name: 'Evidence Judge', expertise: 'Evidence Evaluation', scores: verdictData.evidenceScore.scores, reasoning: verdictData.evidenceScore.reasoning },
        verdictData.rhetoricScore && { name: 'Rhetoric Judge', expertise: 'Rhetoric & Persuasion', scores: verdictData.rhetoricScore.scores, reasoning: verdictData.rhetoricScore.reasoning },
      ].filter(Boolean) : undefined;

      const winner = verdictData?.finalScore ? {
        winner: verdictData.finalScore.winner,
        totalScore: verdictData.finalScore.pro + verdictData.finalScore.con,
        breakdown: {
          logic: verdictData.logicScore?.scores?.pro || 0,
          evidence: verdictData.evidenceScore?.scores?.pro || 0,
          rhetoric: verdictData.rhetoricScore?.scores?.pro || 0,
        }
      } : undefined;

      return (
        <motion.div key={key} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <VerdictScene
            judges={judges}
            winner={winner}
            proAgent={proAgent?.persona?.name}
            conAgent={conAgent?.persona?.name}
          />
        </motion.div>
      );
    }

    default:
      return (
        <motion.div key={key} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 sm:py-20">
          <div className="flex gap-2 justify-center mb-4">
            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <div className="w-2 h-2 rounded-full bg-white animate-pulse delay-75" />
            <div className="w-2 h-2 rounded-full bg-white animate-pulse delay-150" />
          </div>
          <p className="text-sm text-gray-400">{phase || 'Preparing debate...'}</p>
        </motion.div>
      );
  }
}

export function ArenaView({ debate }: ArenaViewProps) {
  // Get current phase
  const currentPhase = debate.currentPhase?.type || 'preparing';

  // Get agents (Pro vs Con) using explicit side field
  const proAgent = debate.agents?.find(a => a.side === 'pro');
  const conAgent = debate.agents?.find(a => a.side === 'con');

  // Check if we're in pre-show (show full personas) or live debate (compact)
  const isPreShow = ['preparing', 'researching', 'pre-show'].includes(currentPhase);

  return (
    <div className="h-screen bg-black text-white flex flex-col overflow-hidden">
      {/* Compact Header - Only visible after pre-show */}
      {!isPreShow && proAgent && conAgent && (
        <header className="border-b border-gray-800 bg-black px-4 sm:px-6 py-2 sm:py-3 flex-shrink-0">
          <div className="flex items-center justify-between gap-4">
            {/* Agent Names */}
            <div className="flex items-center gap-3 sm:gap-6">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500
                              flex items-center justify-center text-white text-xs sm:text-sm font-bold">
                  {proAgent.persona.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <span className="text-xs sm:text-sm font-semibold">{proAgent.persona.name}</span>
              </div>
              <div className="text-gray-600 text-xs">VS</div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500
                              flex items-center justify-center text-white text-xs sm:text-sm font-bold">
                  {conAgent.persona.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <span className="text-xs sm:text-sm font-semibold">{conAgent.persona.name}</span>
              </div>
            </div>

            {/* Topic */}
            <div className="flex-1 min-w-0 text-right">
              <h1 className="text-xs sm:text-sm font-medium text-gray-400 truncate">
                {debate.topic}
              </h1>
            </div>
          </div>
        </header>
      )}

      {/* Phase Timeline - Compact horizontal bar */}
      {!isPreShow && (
        <div className="border-b border-gray-800 px-4 sm:px-6 py-2 flex-shrink-0">
          <PhaseTimeline
            currentPhase={currentPhase}
            progress={debate.currentPhase?.progress || 0}
          />
        </div>
      )}

      {/* Main Content - Takes remaining space, no scroll */}
      <main className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <AnimatePresence mode="wait">
            {renderPhaseContent(currentPhase, debate, proAgent, conAgent)}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
