import { generateText, Output } from "ai";
import { z } from "zod";
import { gateway } from "../ai-gateway/client.ts";
import { inngest } from "../inngest/client.ts";
import { enhancedDebateStore } from "../state/enhanced-debate-store.ts";

/**
 * Closing Statements Phase
 * Final pitch with no new evidence - pure persuasion and emotional appeal
 */
export const closingStatementsFunction = inngest.createFunction(
  { id: "closing-statements" },
  { event: "closing/start" },
  async ({ event, step }) => {
    const { debateId, topic, agents, debateContext } = event.data;

    console.log(`🎬 CLOSING STATEMENTS: Final pitch time`);

    const proAgent = agents.find((a: any) => a.side === "pro");
    const conAgent = agents.find((a: any) => a.side === "con");

    // Schema for closing statement (simpler than full argument)
    const ClosingStatementSchema = z.object({
      opening: z.string().describe("Reference back to your opening statement"),

      synthesis: z.string().describe("Weave together your strongest points from the entire debate"),

      emotional_appeal: z.string().describe("Make them FEEL why this matters - personal, human connection"),

      opponent_acknowledgment: z
        .string()
        .optional()
        .describe("Gracefully acknowledge opponent's strong points, then pivot"),

      final_pitch: z.string().describe("Your last words - make them count. 2-3 sentences."),

      rhetorical_climax: z
        .object({
          text: z.string(),
          device: z.enum(["question", "call_to_action", "reframe", "callback"]),
        })
        .describe("Your mic-drop moment"),

      emotional_tone: z.enum(["resolute", "passionate", "measured", "urgent", "hopeful"]),

      callback_references: z.array(z.string()).describe("References to earlier moments in the debate"),
    });

    // Step 1: Con goes first (traditional debate format)
    const conClosing = await step.run("generate-con-closing", async () => {
      console.log(`✍️  ${conAgent.persona.name}'s closing statement...`);

      const result = await generateText({
        model: gateway("google/gemini-3-flash"),
        output: Output.object({
          schema: ClosingStatementSchema,
        }),
        prompt: `${conAgent.systemPrompt}

DEBATE TOPIC: "${topic}"
YOUR STANCE: ${conAgent.stance}
PHASE: CLOSING STATEMENT (Final words - no new evidence allowed)

THE ENTIRE DEBATE SO FAR:
${JSON.stringify(debateContext, null, 2)}

This is your LAST chance to persuade. Make every word count.

CLOSING STATEMENT REQUIREMENTS:

1. OPENING (1 sentence):
   - Reference back to where you started
   - "I opened by saying..." or "I asked you to consider..."
   - Creates narrative closure

2. SYNTHESIS (2-3 sentences):
   - Weave together your strongest points
   - Show the coherent story of your argument
   - "Throughout this debate, I've shown that..."

3. EMOTIONAL APPEAL (2-3 sentences):
   - Connect to human stakes
   - Make it personal and real
   - "This isn't about policy abstractions - it's about..."

4. OPPONENT ACKNOWLEDGMENT (1 sentence, OPTIONAL):
   - If opponent made a genuinely strong point, acknowledge it with grace
   - Then immediately pivot: "While my opponent correctly noted X, that actually supports my case because..."
   - Shows intellectual honesty and confidence

5. FINAL PITCH (2-3 sentences):
   - Your absolute last words
   - Synthesize everything
   - Leave a lasting impression

6. RHETORICAL CLIMAX:
   - End with POWER
   - Rhetorical question: "So I ask you one final time: [reframe entire debate]"
   - Call to action: "We must choose [your side] - our future depends on it"
   - Reframe: "This debate was never about X vs Y - it's about [bigger truth]"
   - Callback: "Remember when I said [opening hook]? Now you know why."

7. EMOTIONAL TONE:
   - Choose: resolute, passionate, measured, urgent, or hopeful
   - Match your persona's style

8. CALLBACK REFERENCES:
   - List specific moments you're referencing
   - "My opening metaphor", "The cross-exam exchange about X", etc.

CRITICAL RULES:
✓ NO new evidence (judges will penalize)
✓ Pure persuasion and synthesis
✓ Make them FEEL, not just think
✓ Callbacks create narrative closure
✓ Your rhetorical climax must land
✗ Don't introduce new arguments
✗ Don't attack opponent (stay gracious)
✗ Don't be defensive

This is your moment. Make it beautiful.`,
      });

      console.log(`✅ Con closing: "${result.output.rhetorical_climax.text.substring(0, 60)}..."`);
      return result.output;
    });

    // Step 2: Store Con closing
    await step.run("store-con-closing", async () => {
      enhancedDebateStore.setClosingStatement(debateId, "con", {
        agent: conAgent.persona.name,
        statement: conClosing,
        timestamp: Date.now(),
      });
    });

    console.log(`\n${"─".repeat(60)}\n`);

    // Step 3: Pro closing (gets last word)
    const proClosing = await step.run("generate-pro-closing", async () => {
      console.log(`✍️  ${proAgent.persona.name}'s closing statement (LAST WORD)...`);

      const result = await generateText({
        model: gateway("google/gemini-3-flash"),
        output: Output.object({
          schema: ClosingStatementSchema,
        }),
        prompt: `${proAgent.systemPrompt}

DEBATE TOPIC: "${topic}"
YOUR STANCE: ${proAgent.stance}
PHASE: CLOSING STATEMENT (You have the LAST WORD - use it wisely)

THE ENTIRE DEBATE:
${JSON.stringify(debateContext, null, 2)}

OPPONENT'S CLOSING:
${JSON.stringify(conClosing, null, 2)}

You have heard EVERYTHING. Now you get the final word. This is your advantage.

[Same requirements as Con's closing prompt above]

ADDITIONAL STRATEGIC NOTES:
- You can subtly respond to Con's closing if needed
- But don't be defensive - stay on offense
- Your last words will echo in the judges' minds
- Make your rhetorical climax UNFORGETTABLE

The last word is power. Use it.`,
      });

      console.log(`✅ Pro closing: "${result.output.rhetorical_climax.text.substring(0, 60)}..."`);
      return result.output;
    });

    // Step 4: Store Pro closing
    await step.run("store-pro-closing", async () => {
      enhancedDebateStore.setClosingStatement(debateId, "pro", {
        agent: proAgent.persona.name,
        statement: proClosing,
        timestamp: Date.now(),
      });

      enhancedDebateStore.updatePhase(debateId, "closing-statements", "Complete", 1.0);
    });

    // Step 5: Emit completion
    await step.run("emit-completion", async () => {
      await inngest.send({
        name: "closing/complete",
        data: { debateId },
      });

      console.log(`✅ Closing statements complete! Moving to deliberation...`);
    });

    return {
      conClosing,
      proClosing,
    };
  },
);
