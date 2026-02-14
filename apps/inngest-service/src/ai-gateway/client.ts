import { createGateway } from "ai";

// Initialize AI Gateway once and export it
export const gateway = createGateway({
  apiKey: process.env.AI_GATEWAY_API_KEY ?? "",
});
