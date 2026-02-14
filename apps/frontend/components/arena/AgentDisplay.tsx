// components/arena/AgentDisplay.tsx
"use client";

import { motion } from "framer-motion";
import { Agent } from "@/types/debate";

interface AgentDisplayProps {
  agent: Agent;
  side: 'pro' | 'con';
  index: number;
}

const AGENT_COLORS = [
  'from-blue-500 to-cyan-500',
  'from-purple-500 to-pink-500',
  'from-emerald-500 to-teal-500',
];

export function AgentDisplay({ agent, side, index }: AgentDisplayProps) {
  // Generate initials from name
  const initials = agent.persona.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-gray-900 border border-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6
                 hover:border-gray-700 transition-colors"
    >
      {/* Avatar + Name */}
      <div className="flex items-start gap-3 sm:gap-4 mb-4">
        {/* Avatar Circle */}
        <div className={`
          flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-full
          bg-gradient-to-br ${AGENT_COLORS[index % AGENT_COLORS.length]}
          flex items-center justify-center text-white
          text-base sm:text-xl font-bold shadow-lg
        `}>
          {initials}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg lg:text-xl font-bold mb-1 truncate">
            {agent.persona.name}
          </h3>
          <p className="text-xs sm:text-sm text-gray-400 line-clamp-2">
            {agent.stance}
          </p>
        </div>
      </div>

      {/* Background */}
      <div className="mb-4">
        <p className="text-xs sm:text-sm text-gray-300 line-clamp-3 leading-relaxed">
          {agent.persona.background}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {/* Speaking Style */}
        <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3">
          <div className="text-[0.625rem] sm:text-xs text-gray-500 uppercase tracking-wide mb-1">
            Style
          </div>
          <div className="text-xs sm:text-sm font-medium truncate">
            {agent.persona.traits.speaking_style.split(',')[0]}
          </div>
        </div>

        {/* Rhetoric */}
        <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3">
          <div className="text-[0.625rem] sm:text-xs text-gray-500 uppercase tracking-wide mb-1">
            Rhetoric
          </div>
          <div className="text-xs sm:text-sm font-medium truncate">
            {agent.persona.traits.rhetoric_preference.split(',')[0]}
          </div>
        </div>
      </div>

      {/* Signature Move */}
      {agent.persona.traits.catchphrases && agent.persona.traits.catchphrases.length > 0 && (
        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-800">
          <div className="text-[0.625rem] sm:text-xs text-gray-500 uppercase tracking-wide mb-1.5">
            Signature
          </div>
          <div className="text-xs sm:text-sm text-gray-300 italic">
            "{agent.persona.traits.catchphrases[0]}"
          </div>
        </div>
      )}
    </motion.div>
  );
}
