/**
 * Momentum tracking system
 * Calculates debate momentum shifts based on various factors
 */

import type { MomentumEvent } from "../schemas/enhanced-types.ts";

export interface MomentumFactors {
  logical_strength: number; // -10 to +10
  evidence_quality: number; // -10 to +10
  rhetorical_impact: number; // -10 to +10
  direct_engagement: number; // -10 to +10
  audience_appeal: number; // -10 to +10
}

export function calculateMomentumShift(exchange: any, phase: string): MomentumEvent {
  const factors: MomentumFactors = {
    logical_strength: analyzeLogic(exchange),
    evidence_quality: analyzeEvidence(exchange),
    rhetorical_impact: analyzeRhetoric(exchange),
    direct_engagement: analyzeEngagement(exchange),
    audience_appeal: analyzeAppeal(exchange),
  };

  const totalShift = Object.values(factors).reduce((sum, val) => sum + val, 0) / 5;

  return {
    timestamp: Date.now(),
    phase,
    trigger: identifyKeyFactor(factors),
    shift: Math.round(totalShift * 10) / 10, // Round to 1 decimal
    description: generateShiftDescription(factors, totalShift),
  };
}

function analyzeLogic(exchange: any): number {
  // Simplified logic analysis
  // In real implementation, would use AI to analyze logical structure
  if (!exchange) return 0;

  let score = 0;

  // Check for logical fallacies (negative impact)
  if (exchange.logicalIssues && exchange.logicalIssues.length > 0) {
    score -= exchange.logicalIssues.length * 2;
  }

  // Check for strong syllogisms (positive impact)
  if (exchange.mainPoints && exchange.mainPoints.length >= 3) {
    score += 3;
  }

  // Check for counter-arguments
  if (exchange.directEngagement || exchange.counterToOpposition) {
    score += 2;
  }

  return Math.max(-10, Math.min(10, score));
}

function analyzeEvidence(exchange: any): number {
  if (!exchange) return 0;

  let score = 0;

  // Quality of evidence
  if (exchange.evidence && exchange.evidence.length > 0) {
    score += Math.min(exchange.evidence.length * 2, 8);

    // Check for credible sources
    const hasCredibleSources = exchange.evidence.some(
      (e: any) => e.source && (e.source.includes("study") || e.source.includes("report")),
    );
    if (hasCredibleSources) score += 2;
  }

  return Math.max(-10, Math.min(10, score));
}

function analyzeRhetoric(exchange: any): number {
  if (!exchange) return 0;

  let score = 0;

  // Rhetorical devices
  if (exchange.keyMoments && exchange.keyMoments.length > 0) {
    score += exchange.keyMoments.length * 2;
  }

  // Emotional journey
  if (exchange.emotional_journey) {
    score += 2;
  }

  // Personal element
  if (exchange.personalElement) {
    score += 3;
  }

  // Opening hook
  if (exchange.opening?.hook_type) {
    score += 2;
  }

  return Math.max(-10, Math.min(10, score));
}

function analyzeEngagement(exchange: any): number {
  if (!exchange) return 0;

  let score = 0;

  // Direct quote of opponent
  if (exchange.directEngagement?.opponentQuote) {
    score += 4;
  }

  // Response quality
  if (exchange.directEngagement?.response) {
    const responseLength = exchange.directEngagement.response.length;
    if (responseLength > 100) score += 3;
  }

  // Tone (aggressive/direct = higher engagement)
  const tone = exchange.directEngagement?.tone;
  if (tone === "aggressive" || tone === "direct") {
    score += 2;
  }

  return Math.max(-10, Math.min(10, score));
}

function analyzeAppeal(exchange: any): number {
  if (!exchange) return 0;

  let score = 5; // Neutral baseline

  // Conclusion with rhetorical power
  if (exchange.conclusion?.rhetorical_device) {
    score += 3;
  }

  // Callback to earlier point (shows coherence)
  if (exchange.conclusion?.callback_to) {
    score += 2;
  }

  return Math.max(-10, Math.min(10, score));
}

function identifyKeyFactor(factors: MomentumFactors): string {
  const entries = Object.entries(factors);
  const max = entries.reduce((a, b) => (Math.abs(a[1]) > Math.abs(b[1]) ? a : b));
  return max[0].replace("_", " ");
}

function generateShiftDescription(factors: MomentumFactors, totalShift: number): string {
  if (Math.abs(totalShift) < 1) {
    return "No significant momentum shift";
  }

  const keyFactor = identifyKeyFactor(factors);
  const direction = totalShift > 0 ? "Pro" : "Con";

  if (Math.abs(totalShift) > 5) {
    return `Strong ${direction} momentum from ${keyFactor}`;
  } else if (Math.abs(totalShift) > 3) {
    return `${direction} gains ground with ${keyFactor}`;
  } else {
    return `Slight ${direction} edge on ${keyFactor}`;
  }
}

export function determineMomentumLeader(history: MomentumEvent[]): "pro" | "con" | "tied" {
  const totalShift = history.reduce((sum, event) => sum + event.shift, 0);

  if (totalShift > 5) return "pro";
  if (totalShift < -5) return "con";
  return "tied";
}

export function calculateVolatility(history: MomentumEvent[]): "stable" | "shifting" | "dramatic" {
  if (history.length < 3) return "stable";

  const recentShifts = history.slice(-5).map((e) => Math.abs(e.shift));
  const avgShift = recentShifts.reduce((a, b) => a + b, 0) / recentShifts.length;

  if (avgShift > 5) return "dramatic";
  if (avgShift > 2) return "shifting";
  return "stable";
}
