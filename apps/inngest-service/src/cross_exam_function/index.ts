import { generateText, Output } from "ai";
import { z } from "zod";
import { gateway } from "../ai-gateway/client.ts";
import { inngest } from "../inngest/client.ts";
import { CrossExamAnalysisSchema, CrossExamAnswerSchema, CrossExamQuestionSchema } from "../schemas/enhanced-types.ts";
import { enhancedDebateStore } from "../state/enhanced-debate-store.ts";
import { detectControversyMoments } from "../utils/controversy-detector.ts";
import { calculateMomentumShift } from "../utils/momentum-tracker.ts";

/**
 * Cross-Examination Phase
 * Direct Q&A between agents - creates real clash and dramatic moments
 * Stays sequential (Q->A->Analysis is inherently dependent)
 */
export const crossExaminationFunction = inngest.createFunction(
  { id: "cross-examination" },
  { event: "cross-exam/start" },
  async ({ event, step, publish }) => {
    const { debateId, roundNum, questioner, respondent, context } = event.data;

    console.log(
      `⚔️ Cross-Examination Round ${roundNum}: ${questioner.persona.name} questions ${respondent.persona.name}`,
    );

    // Step 1: Generate pointed questions
    const questions = await step.run("generate-questions", async () => {
      const result = await generateText({
        model: gateway("google/gemini-3-flash"),
        output: Output.object({
          schema: z.object({
            questions: z.array(CrossExamQuestionSchema),
          }),
        }),
        prompt: `You are ${questioner.persona.name} cross-examining ${respondent.persona.name}.

DEBATE TOPIC: "${context.topic}"
YOUR STANCE: ${questioner.stance}
OPPONENT'S STANCE: ${respondent.stance}

OPPONENT'S PREVIOUS ARGUMENTS:
${JSON.stringify(context.opponentArguments, null, 2)}

Your goal: Ask 2 POINTED questions that expose weaknesses or force concessions.

QUESTION REQUIREMENTS:
1. Each question must be specific and answerable
2. Force them to choose between bad options OR make a concession
3. Be direct and challenging

Return 2 questions with intent and target_weakness for each.`,
      });

      console.log(`✅ Generated ${result.output.questions.length} cross-exam questions`);
      return result.output.questions;
    });

    // Step 2: Generate answers
    const answers = await step.run("generate-answers", async () => {
      const result = await generateText({
        model: gateway("google/gemini-3-flash"),
        output: Output.object({
          schema: z.object({
            answers: z.array(CrossExamAnswerSchema),
          }),
        }),
        prompt: `You are ${respondent.persona.name} being cross-examined by ${questioner.persona.name}.

QUESTIONS YOU MUST ANSWER:
${questions.map((q, i) => `${i + 1}. ${q.question}`).join("\n")}

YOUR STANCE: ${respondent.stance}

Answer in ONE sentence per question. Maximum 15 words per answer. Sound like a real person talking — casual, direct, with contractions. No formal or academic language.

ANSWER EACH QUESTION using one of these strategies:
- DIRECT_ANSWER: Answer honestly and directly
- DEFLECTION: Redirect to a different point
- COUNTER_ATTACK: Turn the question against them
- CONCESSION: Admit a limitation BUT pivot

Return answers with strategy and evasion flag for each.`,
      });

      console.log(`✅ Generated ${result.output.answers.length} answers`);
      return result.output.answers;
    });

    // Step 3: Analyze exchange
    const analysis = await step.run("analyze-exchange", async () => {
      const result = await generateText({
        model: gateway("google/gemini-3-flash"),
        output: Output.object({
          schema: CrossExamAnalysisSchema,
        }),
        prompt: `Analyze this cross-examination exchange:

QUESTIONS:
${questions.map((q, i) => `${i + 1}. ${q.question}`).join("\n")}

ANSWERS:
${answers.map((a, i) => `${i + 1}. ${a.answer}\n   Strategy: ${a.strategy}`).join("\n")}

Evaluate:
1. DIRECTNESS_SCORE (0-10): How directly did they answer? (10 = all direct, 0 = all evasion)
2. CONCESSIONS_MADE: List any weaknesses they admitted
3. COUNTER_ATTACKS: List any times they turned questions against questioner
4. EVASIONS: List any questions they dodged
5. WINNER: Who won this exchange? (questioner, respondent, or tie)
6. KEY_EXCHANGE: The single most important Q&A moment

Be objective but decisive. Someone won this exchange.`,
      });

      console.log(`✅ Exchange winner: ${result.output.winner}`);
      return result.output;
    });

    // Step 4: Update momentum
    await step.run("update-momentum", async () => {
      const momentumShift = calculateMomentumShift({ questions, answers, analysis }, `cross-exam-${roundNum}`);

      enhancedDebateStore.addMomentumEvent(debateId, momentumShift);
      console.log(`📊 Momentum shift: ${momentumShift.description}`);
    });

    // Step 5: Detect controversy moments
    await step.run("detect-controversy", async () => {
      const moments = detectControversyMoments({ answers, analysis }, respondent.persona.name);

      moments.forEach((moment) => {
        enhancedDebateStore.addControversyMoment(debateId, moment);
      });

      console.log(`🔥 Detected ${moments.length} controversy moments`);
    });

    // Step 6: Store results + publish
    await step.run("store-results", async () => {
      const roundData = {
        questioner: questioner.persona.name,
        respondent: respondent.persona.name,
        questions,
        answers,
        analysis,
      };
      enhancedDebateStore.setCrossExamRound(debateId, roundNum as 1 | 2, roundData);

      await publish({
        channel: `debate:${debateId}`,
        topic: "updates",
        data: { type: "cross-exam", data: { round1: roundData } },
      });

      await publish({
        channel: `debate:${debateId}`,
        topic: "updates",
        data: { type: "momentum", data: enhancedDebateStore.get(debateId)?.momentum },
      });
    });

    // Step 7: Emit completion event
    await step.run("emit-completion", async () => {
      await inngest.send({
        name: "cross-exam/complete",
        data: {
          debateId,
          roundNum,
        },
      });
      console.log(`✅ Cross-exam round ${roundNum} complete event sent`);
    });

    return {
      questions,
      answers,
      analysis,
      winner: analysis.winner,
    };
  },
);
