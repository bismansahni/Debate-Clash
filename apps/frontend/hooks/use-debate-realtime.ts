"use client";

import { useCallback, useEffect, useReducer, useState } from "react";
import { useInngestSubscription } from "@inngest/realtime/hooks";
import { fetchRealtimeToken } from "@/app/actions/realtime-token";
import type { DebateData } from "@/types/debate";

type RealtimeMessage = {
  type: string;
  side?: string;
  judgeType?: string;
  data: any;
};

function debateReducer(state: DebateData, message: RealtimeMessage): DebateData {
  switch (message.type) {
    case "init":
      return {
        ...state,
        debateId: message.data.debateId,
        topic: message.data.topic,
        agents: message.data.agents,
        analysis: message.data.analysis,
        status: "opening-statements",
        currentPhase: { type: "opening-statements", progress: 0 },
      };

    case "status":
      return {
        ...state,
        status: message.data.phase,
        currentPhase: {
          type: message.data.phase,
          progress: message.data.progress ?? 0,
        },
      };

    case "opening": {
      const side = message.side as "pro" | "con";
      const existing = state.phases?.openingStatements ?? {};
      return {
        ...state,
        phases: {
          ...state.phases,
          openingStatements: {
            ...existing,
            ...(side === "pro" ? { proStatement: message.data } : { conStatement: message.data }),
          },
        },
      };
    }

    case "cross-exam":
      return {
        ...state,
        phases: {
          ...state.phases,
          crossExamination: message.data,
        },
      };

    case "rebuttal": {
      const side = message.side as "pro" | "con";
      const existing = state.phases?.rebuttals ?? {};
      return {
        ...state,
        phases: {
          ...state.phases,
          rebuttals: {
            ...existing,
            ...(side === "pro" ? { proRebuttal: message.data } : { conRebuttal: message.data }),
          },
        },
      };
    }

    case "lightning":
      return {
        ...state,
        phases: {
          ...state.phases,
          lightningRound: message.data,
        },
      };

    case "closing": {
      const side = message.side as "pro" | "con";
      const existing = state.phases?.closingStatements ?? {};
      return {
        ...state,
        phases: {
          ...state.phases,
          closingStatements: {
            ...existing,
            ...(side === "pro" ? { proClosing: message.data } : { conClosing: message.data }),
          },
        },
      };
    }

    case "verdict-judge": {
      const judgeType = message.judgeType as string;
      const existing = state.phases?.verdict ?? {};
      const key = `${judgeType}Score` as "logicScore" | "evidenceScore" | "rhetoricScore";
      return {
        ...state,
        phases: {
          ...state.phases,
          verdict: {
            ...existing,
            [key]: message.data,
          },
        },
      };
    }

    case "verdict-final":
      return {
        ...state,
        phases: {
          ...state.phases,
          verdict: {
            ...state.phases?.verdict,
            finalScore: message.data,
          },
        },
      };

    default:
      return state;
  }
}

export function useDebateRealtime(debateId: string | null, initialTopic?: string) {
  const [state, dispatch] = useReducer(debateReducer, {
    debateId: debateId ?? "",
    topic: initialTopic ?? "",
    status: "preparing",
    currentPhase: { type: "preparing", progress: 0 },
    phases: {},
  });

  const [isConnected, setIsConnected] = useState(false);

  const refreshToken = useCallback(async () => {
    if (!debateId) return null;
    return fetchRealtimeToken(debateId);
  }, [debateId]);

  const subscription = useInngestSubscription({
    enabled: !!debateId,
    refreshToken,
  });

  // Process incoming messages
  useEffect(() => {
    if (!subscription.data || subscription.data.length === 0) return;

    // Process only the latest message
    const latestMessage = subscription.data[subscription.data.length - 1];
    if (latestMessage?.data) {
      dispatch(latestMessage.data as RealtimeMessage);
    }
  }, [subscription.data]);

  // Track connection state
  useEffect(() => {
    setIsConnected(subscription.state === "active");
  }, [subscription.state]);

  return {
    debateData: state,
    isConnected,
    error: subscription.error,
  };
}
