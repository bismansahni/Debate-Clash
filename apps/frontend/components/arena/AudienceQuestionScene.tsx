// components/arena/AudienceQuestionScene.tsx
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

export function AudienceQuestionScene({
  questions = [],
  proResponses = [],
  conResponses = [],
  proAgent = "Pro",
  conAgent = "Con"
}: AudienceQuestionSceneProps) {
  const [selectedQuestion, setSelectedQuestion] = useState(0);

  if (questions.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12 text-gray-500">
        <p className="text-sm sm:text-base">Audience questions loading...</p>
      </div>
    );
  }

  const currentQuestion = questions[selectedQuestion];
  const proAnswer = proResponses[selectedQuestion];
  const conAnswer = conResponses[selectedQuestion];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">👥 Audience Questions</h2>
          <p className="text-xs sm:text-sm text-gray-400">Real people, real concerns</p>
        </div>
        <div className="flex items-center gap-2">
          {questions.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedQuestion(idx)}
              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full text-xs sm:text-sm font-bold transition-all ${selectedQuestion === idx ? 'bg-white text-black scale-110' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </div>

      <motion.div
        key={selectedQuestion}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10"
      >
        <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-white text-lg sm:text-2xl font-bold shadow-lg">
            {currentQuestion.persona.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-bold mb-1">
              {currentQuestion.persona.name}
              {currentQuestion.persona.age && <span className="text-gray-500 font-normal ml-2">{currentQuestion.persona.age}</span>}
            </h3>
            <p className="text-xs sm:text-sm text-gray-400">{currentQuestion.persona.perspective}</p>
          </div>
        </div>
        <div className="mb-4 sm:mb-6">
          <p className="text-lg sm:text-xl lg:text-2xl text-white leading-relaxed">"{currentQuestion.question}"</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {proAnswer && <ResponseCard agent={proAgent} answer={proAnswer.answer} side="pro" />}
        {conAnswer && <ResponseCard agent={conAgent} answer={conAnswer.answer} side="con" />}
      </div>
    </motion.div>
  );
}

interface ResponseCardProps {
  agent: string;
  answer: string;
  side: 'pro' | 'con';
}

function ResponseCard({ agent, answer, side }: ResponseCardProps) {
  const gradientClass = side === 'pro' ? 'from-blue-500 to-cyan-500' : 'from-purple-500 to-pink-500';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: side === 'pro' ? 0.1 : 0.2 }}
      className="bg-gray-900 border border-gray-800 rounded-xl sm:rounded-2xl overflow-hidden"
    >
      <div className={`bg-gradient-to-r ${gradientClass} p-3 sm:p-4`}>
        <h4 className="text-sm sm:text-base font-bold text-white">{agent}'s Answer</h4>
      </div>
      <div className="p-4 sm:p-6">
        <p className="text-sm sm:text-base text-gray-300 leading-relaxed">{answer}</p>
      </div>
    </motion.div>
  );
}
