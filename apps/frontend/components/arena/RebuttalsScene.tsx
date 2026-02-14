// components/arena/RebuttalsScene.tsx
"use client";

import { motion } from "framer-motion";
import { TypewriterText } from "@/components/ui/TypewriterText";

interface RebuttalsSceneProps {
  proRebuttal?: any;
  conRebuttal?: any;
  proAgent?: string;
  conAgent?: string;
}

export function RebuttalsScene({
  proRebuttal,
  conRebuttal,
  proAgent = "Pro",
  conAgent = "Con"
}: RebuttalsSceneProps) {
  if (!proRebuttal && !conRebuttal) {
    return (
      <div className="text-center py-8 sm:py-12 text-gray-500">
        <p className="text-sm sm:text-base">Rebuttals loading...</p>
      </div>
    );
  }

  const getRebuttalText = (rebuttal: any): string => {
    if (typeof rebuttal === 'string') return rebuttal;
    if (rebuttal?.mainPoints) return rebuttal.mainPoints.join('\n\n');
    return JSON.stringify(rebuttal);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 sm:space-y-8"
    >
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">🔄 Rebuttals</h2>
        <p className="text-xs sm:text-sm text-gray-400">Direct responses to opponent's arguments</p>
      </div>
      {proRebuttal && <RebuttalCard agent={proAgent} rebuttal={getRebuttalText(proRebuttal)} side="pro" order={0} />}
      {conRebuttal && <RebuttalCard agent={conAgent} rebuttal={getRebuttalText(conRebuttal)} side="con" order={1} />}
    </motion.div>
  );
}

interface RebuttalCardProps {
  agent: string;
  rebuttal: string;
  side: 'pro' | 'con';
  order: number;
}

function RebuttalCard({ agent, rebuttal, side, order }: RebuttalCardProps) {
  const gradientClass = side === 'pro' ? 'from-blue-500 to-cyan-500' : 'from-purple-500 to-pink-500';
  const initials = agent.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: order * 0.2 }}
      className="bg-gray-900 border border-gray-800 rounded-2xl sm:rounded-3xl overflow-hidden"
    >
      <div className={`bg-gradient-to-r ${gradientClass} p-4 sm:p-6`}>
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-base sm:text-lg font-bold">
            {initials}
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white">{agent}</h3>
            <p className="text-xs sm:text-sm text-white/80">Rebuttal</p>
          </div>
        </div>
      </div>
      <div className="p-6 sm:p-8 lg:p-10">
        <TypewriterText text={rebuttal} speed={15} className="text-sm sm:text-base lg:text-lg text-gray-200 leading-relaxed whitespace-pre-line" />
      </div>
    </motion.div>
  );
}
