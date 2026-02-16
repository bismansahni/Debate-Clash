"use server";

import { inngest } from "@/lib/inngest";
import { getSubscriptionToken } from "@inngest/realtime";

export async function fetchRealtimeToken(debateId: string) {
  const token = await getSubscriptionToken(inngest, {
    channel: `debate:${debateId}`,
    topics: ["updates"],
  });
  return token;
}
