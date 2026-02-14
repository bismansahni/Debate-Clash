import { inngest } from "../inngest/client.ts";

/**
 * API endpoint to trigger enhanced debates
 * POST /api/trigger-enhanced-debate
 * Body: { topic: string }
 */
export async function triggerEnhancedDebate(topic: string): Promise<{
    success: boolean;
    debateId?: string;
    message: string;
}> {
    try {
        const result = await inngest.send({
            name: "debate/initiate-enhanced",
            data: { topic }
        });

        // Extract debate ID from event (will be in orchestrator response)
        const debateId = `debate-${result.ids[0]}`;

        return {
            success: true,
            debateId,
            message: "Enhanced debate initiated successfully!"
        };
    } catch (error) {
        console.error("Failed to trigger enhanced debate:", error);
        return {
            success: false,
            message: error instanceof Error ? error.message : "Unknown error"
        };
    }
}

/**
 * Get enhanced debate status
 * GET /api/enhanced-debate/:debateId
 */
export { enhancedDebateStore } from "../state/enhanced-debate-store.ts";
