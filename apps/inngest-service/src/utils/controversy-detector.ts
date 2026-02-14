/**
 * Controversy moment detection
 * Identifies memorable, shareable, and impactful moments in debates
 */

import type { ControversyMoment } from "../schemas/enhanced-types.ts";

export function detectControversyMoments(exchange: any, agent: string): ControversyMoment[] {
  const moments: ControversyMoment[] = [];

  // Detect concessions
  const concession = detectConcession(exchange, agent);
  if (concession) moments.push(concession);

  // Detect zingers
  const zingers = detectZingers(exchange, agent);
  moments.push(...zingers);

  // Detect reversals
  const reversal = detectReversal(exchange, agent);
  if (reversal) moments.push(reversal);

  // Detect deflections
  const deflection = detectDeflection(exchange, agent);
  if (deflection) moments.push(deflection);

  // Detect attacks
  const attack = detectAttack(exchange, agent);
  if (attack) moments.push(attack);

  return moments;
}

function detectConcession(exchange: any, agent: string): ControversyMoment | null {
  // Look for admission patterns
  const concessionPhrases = ["you're right", "i concede", "fair point", "i admit", "that's valid", "i agree that"];

  const text = JSON.stringify(exchange).toLowerCase();

  for (const phrase of concessionPhrases) {
    if (text.includes(phrase)) {
      return {
        timestamp: Date.now(),
        type: "concession",
        agent,
        description: "Agent admitted weakness in their argument",
        impact: "high",
        clip: extractConcessionText(exchange),
      };
    }
  }

  return null;
}

function detectZingers(exchange: any, agent: string): ControversyMoment[] {
  const zingers: ControversyMoment[] = [];

  // Check key moments
  if (exchange.keyMoments) {
    for (const moment of exchange.keyMoments) {
      if (moment.type === "zinger" || moment.type === "rhetorical_climax") {
        zingers.push({
          timestamp: Date.now(),
          type: "zinger",
          agent,
          description: "Memorable one-liner",
          impact: moment.impact_level >= 2 ? "high" : "medium",
          clip: moment.text,
        });
      }
    }
  }

  // Also check for rhetorical questions
  if (exchange.conclusion?.rhetorical_device === "question") {
    zingers.push({
      timestamp: Date.now(),
      type: "zinger",
      agent,
      description: "Powerful rhetorical question",
      impact: "high",
      clip: exchange.conclusion.text,
    });
  }

  return zingers;
}

function detectReversal(exchange: any, agent: string): ControversyMoment | null {
  // Look for using opponent's logic against them
  const reversalPhrases = [
    "by your own logic",
    "using your argument",
    "if we follow your reasoning",
    "that actually proves my point",
    "you've just made my case",
  ];

  const text = JSON.stringify(exchange).toLowerCase();

  for (const phrase of reversalPhrases) {
    if (text.includes(phrase)) {
      return {
        timestamp: Date.now(),
        type: "reversal",
        agent,
        description: "Turned opponent's argument against them",
        impact: "critical",
        clip: extractReversalText(exchange),
      };
    }
  }

  // Also check direct engagement tone
  if (exchange.directEngagement?.tone === "counter_attack") {
    return {
      timestamp: Date.now(),
      type: "reversal",
      agent,
      description: "Counter-attacked opponent's position",
      impact: "high",
      clip: exchange.directEngagement.response,
    };
  }

  return null;
}

function detectDeflection(exchange: any, agent: string): ControversyMoment | null {
  // Detect evasive answers (especially in cross-exam)
  if (exchange.strategy === "deflection" || exchange.evasion === true) {
    return {
      timestamp: Date.now(),
      type: "deflection",
      agent,
      description: "Avoided direct answer to question",
      impact: "medium",
      clip: exchange.answer || exchange.response || "Deflected question",
    };
  }

  return null;
}

function detectAttack(exchange: any, agent: string): ControversyMoment | null {
  // Detect aggressive direct engagement
  if (exchange.directEngagement?.tone === "aggressive") {
    return {
      timestamp: Date.now(),
      type: "attack",
      agent,
      description: "Aggressive challenge to opponent",
      impact: "high",
      clip: exchange.directEngagement.response,
    };
  }

  // Check for calling out fallacies
  if (exchange.logicalIssues && exchange.logicalIssues.length > 0) {
    return {
      timestamp: Date.now(),
      type: "attack",
      agent,
      description: "Called out logical fallacy",
      impact: "high",
      clip: `Identified: ${exchange.logicalIssues[0].fallacy}`,
    };
  }

  return null;
}

function extractConcessionText(exchange: any): string {
  // Try to extract the specific concession
  const text = exchange.answer || exchange.response || JSON.stringify(exchange);

  // Find sentence with concession phrase
  const sentences = text.split(/[.!?]+/);
  for (const sentence of sentences) {
    if (
      sentence.toLowerCase().includes("right") ||
      sentence.toLowerCase().includes("fair") ||
      sentence.toLowerCase().includes("concede")
    ) {
      return sentence.trim();
    }
  }

  return text.substring(0, 150);
}

function extractReversalText(exchange: any): string {
  if (exchange.directEngagement?.response) {
    return exchange.directEngagement.response;
  }

  const text = JSON.stringify(exchange);
  return text.substring(0, 200);
}

export function rankControversyMoments(moments: ControversyMoment[]): ControversyMoment[] {
  // Sort by impact (critical > high > medium > low)
  const impactOrder = { critical: 4, high: 3, medium: 2, low: 1 };

  return moments.sort((a, b) => {
    return impactOrder[b.impact] - impactOrder[a.impact];
  });
}

export function generateShareableClip(moment: ControversyMoment): {
  type: string;
  content: any;
} {
  return {
    type: "controversy_moment",
    content: {
      quote: moment.clip,
      agent: moment.agent,
      type: moment.type,
      context: moment.description,
      impact: moment.impact,
    },
  };
}
