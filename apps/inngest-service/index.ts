import "dotenv/config";
import express from "express";
import cors from "cors";
import { serve } from "inngest/express";

// Debate system imports
import { inngest, functions } from "./src/inngest/enhanced-functions.ts";
import { enhancedDebateStore } from "./src/state/enhanced-debate-store.ts";
import { triggerEnhancedDebate } from "./src/api/trigger-enhanced-debate.ts";


const app = express();

// Enable CORS for Next.js frontend
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
}));

// Important: ensure you add JSON middleware to process incoming JSON POST payloads.
// Increase limit to handle large debate payloads (3 rounds × multiple agents)
app.use(express.json({ limit: '50mb' }));

// API route to trigger debate
app.post("/api/trigger-enhanced-debate", async (req, res) => {
    try {
        const { topic } = req.body;

        if (!topic) {
            return res.status(400).json({ error: "Topic is required" });
        }

        const result = await triggerEnhancedDebate(topic);

        res.json({
            success: result.success,
            debateId: result.debateId,
            message: result.message,
        });
    } catch (error) {
        console.error("Error triggering enhanced debate:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Failed to trigger enhanced debate",
        });
    }
});

// API route to fetch debate status
app.get("/api/enhanced-debate/:debateId", (req, res) => {
    const { debateId } = req.params;
    const debate = enhancedDebateStore.get(debateId);

    if (!debate) {
        return res.status(404).json({ error: "Debate not found" });
    }

    res.json(debate);
});

// API route to list all debates
app.get("/api/enhanced-debates", (req, res) => {
    const debates = enhancedDebateStore.getAll();
    res.json(debates);
});

// Set up the "/api/inngest" routes with the serve handler
app.use("/api/inngest", serve({ client: inngest, functions }));

app.listen(3001, () => {
    console.log('\n🎭 AI Debate Arena');
    console.log('═══════════════════════════════════════');
    console.log('Server running on http://localhost:3001');
    console.log('Inngest endpoint: http://localhost:3001/api/inngest');
    console.log('\n📍 DEBATE API:');
    console.log('  POST   /api/trigger-enhanced-debate');
    console.log('  GET    /api/enhanced-debate/:debateId');
    console.log('  GET    /api/enhanced-debates');
    console.log('═══════════════════════════════════════\n');
});