# 🧪 Testing Guide - Enhanced Debate System

## Quick Start

### 1. Start the Server

```bash
# Terminal 1: Start Inngest Dev Server (if not already running)
npx inngest-cli@latest dev

# Terminal 2: Start the API server
npm run dev
```

You should see:
```
🎭 AI Debate Arena - Enhanced Edition
═══════════════════════════════════════
Server running on http://localhost:3001
Inngest endpoint: http://localhost:3001/api/inngest
```

### 2. Run the Test Script

```bash
# In Terminal 3
npx tsx test-enhanced-debate.ts
```

---

## What to Expect

### Test Output

The test script will show:

1. **Real-time phase updates** (every 2 seconds)
2. **Phase-specific details** (momentum, controversy, fact-checks)
3. **Duration tracking** for each phase
4. **Comprehensive final results**

### Example Output:

```
🎭 Enhanced Debate System - Comprehensive Test
══════════════════════════════════════════════════════════════════════

📝 Debate Topic:
   "Should AI research be regulated by international treaty?"

⏳ Triggering enhanced debate workflow...

✅ Debate triggered successfully!
   Debate ID: debate-abc123
   Event ID: abc123

⏳ Monitoring debate progress (updates every 2 seconds)...
──────────────────────────────────────────────────────────────────────

📍 PHASE: PREPARING
   Progress: 0%

📍 PHASE: PRE-SHOW
   Progress: 50%
   📊 Odds: Pro 55% - Con 45%

📍 PHASE: OPENING-STATEMENTS
   Progress: 25%
   ✅ Pro opening complete
   📊 Momentum: Pro gains ground with rhetorical impact
   🔥 zinger: "Russian roulette with humanity's future..."

📍 PHASE: CROSS-EXAMINATION - Round 1
   Progress: 50%
   ⚔️  Round 1 winner: questioner
   📊 Momentum: Con gains ground with direct engagement

📍 PHASE: VERDICT
   Progress: 100%
   🏆 Winner: Dr. Sarah Chen (2 point margin)

══════════════════════════════════════════════════════════════════════
✅ DEBATE COMPLETE! Total time: 234.5s
══════════════════════════════════════════════════════════════════════

[Detailed results follow...]
```

---

## Check Points

### ✅ Successful Test Indicators:

1. **All 11 phases complete:**
   - ✓ Pre-Show
   - ✓ Research (if needed)
   - ✓ Opening Statements
   - ✓ Cross-Examination
   - ✓ Rebuttals
   - ✓ Audience Questions
   - ✓ Lightning Round
   - ✓ Closing Statements
   - ✓ Deliberation
   - ✓ Verdict
   - ✓ Synthesis

2. **Rich data generated:**
   - Agent personas with personalities
   - Arguments with rhetorical devices
   - Momentum tracking active
   - Controversy moments detected
   - Live fact-checks appearing
   - Judge commentary in distinct voices
   - Narrative synthesis (not bullet points)

3. **Timing:**
   - Total debate: ~3-8 minutes (depending on topic complexity)
   - Each phase completes without timeout

### ❌ Potential Issues:

**Issue:** "No debate data found"
- **Fix:** Check if Inngest Dev is running (`npx inngest-cli@latest dev`)
- **Fix:** Verify server is running on port 3001
- **Fix:** Check Inngest logs at http://localhost:8288

**Issue:** Timeout after 10 minutes
- **Fix:** Check Inngest Dev UI for stuck functions
- **Fix:** Look for errors in server console
- **Fix:** Verify AI Gateway is accessible

**Issue:** Missing phases
- **Fix:** Check that all functions are registered in `enhanced-functions.ts`
- **Fix:** Verify events are being emitted correctly
- **Fix:** Check Inngest Dev UI for failed steps

---

## Manual API Testing

### Trigger Debate:

```bash
curl -X POST http://localhost:3001/api/trigger-enhanced-debate \
  -H "Content-Type: application/json" \
  -d '{"topic": "Should universal basic income replace traditional welfare?"}'
```

Response:
```json
{
  "success": true,
  "debateId": "debate-abc123",
  "message": "Enhanced debate initiated successfully!"
}
```

### Check Status:

```bash
curl http://localhost:3001/api/enhanced-debate/debate-abc123
```

### List All Debates:

```bash
curl http://localhost:3001/api/enhanced-debates
```

---

## Inngest Dev UI

**URL:** http://localhost:8288

### What to Check:

1. **Functions tab:**
   - All 11 enhanced functions should be listed
   - Each should show "Registered"

2. **Stream tab:**
   - Watch events flow in real-time
   - See function execution
   - Check step-by-step progress

3. **Function execution:**
   - Click on any function to see logs
   - Check for errors or warnings
   - Verify data is being passed correctly

---

## Test Different Topics

Try these to test various scenarios:

**Binary debates:**
```bash
"Should AI be allowed to make medical decisions?"
"Is cryptocurrency the future of money?"
```

**Multi-perspective:**
```bash
"How should we approach climate change?"
"What is the best education system?"
```

**Comparison:**
```bash
"Remote work vs office work: which is better?"
"Nuclear vs renewable energy: which should we prioritize?"
```

---

## Debugging Tips

### Check the data structure:

```typescript
// In Node REPL or test script
import { enhancedDebateStore } from "./src/state/enhanced-debate-store.ts";

const debate = enhancedDebateStore.get("debate-abc123");
console.log(JSON.stringify(debate, null, 2));
```

### Verify enhanced features:

```typescript
// Check agent personas
console.log(debate.agents[0].persona);

// Check momentum tracking
console.log(debate.momentum);

// Check controversy moments
console.log(debate.controversyMoments);

// Check synthesis narrative
console.log(debate.synthesis?.narrative);
```

---

## Success Criteria

### ✅ Backend is working if:

1. All 11 phases complete
2. Agents have rich personas (not generic)
3. Arguments include rhetorical devices
4. Judges have distinct commentary voices
5. Synthesis is narrative (not bullets)
6. Momentum tracking shows shifts
7. Controversy moments are detected
8. Live fact-checks appear
9. Total time is reasonable (3-10 min)
10. No function errors in Inngest UI

---

## Next Steps After Testing

Once backend test succeeds:

1. ✅ **Backend works** - All enhanced features functional
2. 🎨 **Build frontend** - Create UI components for 11 phases
3. 🔗 **Integrate** - Connect frontend to enhanced API
4. 🎭 **Demo** - Show client the new experience

---

## Common Test Scenarios

### Scenario 1: Simple Topic (Fast Test)
```bash
Topic: "Is remote work better than office work?"
Expected time: ~3-4 minutes
All phases should complete
```

### Scenario 2: Complex Topic (Full Test)
```bash
Topic: "Should AI research be regulated by international treaty?"
Expected time: ~5-8 minutes
Research phase may be triggered
More detailed arguments
```

### Scenario 3: Stress Test (Multiple Debates)
```bash
# Run 3 debates simultaneously
# Check for race conditions
# Verify each completes independently
```

---

## Support

If stuck:
1. Check Inngest Dev UI logs
2. Review server console output
3. Verify all functions registered
4. Check event names match
5. Ensure AI Gateway is accessible

**Happy Testing!** 🚀
