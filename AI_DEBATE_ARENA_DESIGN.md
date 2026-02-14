# AI Debate Arena - Design Document

## 1. Project Overview

### 1.1 Vision
An autonomous multi-agent system where AI agents engage in structured debates on controversial topics, adapt their arguments based on opponent responses, collaborate through deliberation, and reach reasoned conclusions. The system demonstrates true agentic behavior through dynamic decision-making, strategic adaptation, and collaborative reasoning.

### 1.2 Core Purpose
- Allow users to explore complex topics through AI-powered debate
- Demonstrate multi-agent collaboration and adversarial reasoning
- Provide balanced perspectives on controversial subjects
- Showcase Inngest's orchestration capabilities with truly agentic workflows
- Create an engaging platform for watching AI agents reason and argue

### 1.3 User Experience
Users submit a debate topic. The system spawns multiple AI agents with different positions, who research, argue, rebut, and deliberate over multiple rounds. A moderator manages the debate, fact-checkers validate claims, and judges evaluate arguments. The system produces a comprehensive conclusion document with winning arguments, key insights, and areas of consensus or disagreement.

---

## 2. Core Features

### 2.1 Debate Creation
- User submits a topic or question for debate
- System analyzes topic to determine optimal debate structure
- Automatically selects debate format (binary pro/con, multi-perspective, spectrum)
- Assigns agent positions and personas based on topic nature
- User can optionally specify debate parameters (number of agents, rounds, perspectives)

### 2.2 Autonomous Agent System
- **Debate Agents**: AI agents assigned specific positions who argue their case
  - Research their position using external tools
  - Construct arguments with evidence and reasoning
  - Analyze opponent arguments for weaknesses
  - Adapt strategy each round based on debate progression
  - Decide when to concede points versus double down
  - Identify and exploit logical fallacies in opposing arguments

- **Moderator Agent**: Manages debate flow and quality
  - Enforces debate structure and timing
  - Identifies when agents go off-topic and redirects
  - Detects logical fallacies and calls them out
  - Summarizes key points after each round
  - Decides when debate has reached natural conclusion
  - Maintains civil discourse

- **Judge Agents**: Three independent evaluators with different criteria
  - Logic Judge: Evaluates reasoning soundness and logical consistency
  - Evidence Judge: Assesses quality and credibility of sources
  - Rhetoric Judge: Scores persuasiveness and communication effectiveness
  - Provide detailed scoring with reasoning
  - Deliberate if scores are close

- **Fact-Checker Agent**: Validates claims in real-time
  - Monitors debate for factual claims
  - Researches claims using external sources
  - Flags false or misleading statements
  - Provides corrections with sources
  - Assigns credibility scores to claims

- **Synthesis Agent**: Creates final conclusion
  - Analyzes entire debate comprehensively
  - Identifies strongest arguments from each side
  - Highlights areas of agreement between positions
  - Notes irreconcilable differences
  - Generates balanced conclusion document
  - Extracts key insights and learnings

### 2.3 Multi-Round Debate Structure
- **Research Phase**: Agents gather information and prepare positions
- **Opening Arguments**: Each agent presents their initial case
- **Rebuttal Rounds**: Agents respond to opposing arguments
- **Cross-Examination**: Agents question each other's claims
- **Closing Arguments**: Final statements incorporating all previous points
- **Judgment Phase**: Judges evaluate and deliberate
- **Synthesis Phase**: Final conclusion generation

### 2.4 Real-Time Debate Viewing
- Live updates as agents construct arguments
- Visual representation of debate flow
- Display of agent reasoning and strategy
- Fact-check notifications appearing inline
- Moderator commentary and summaries
- Round-by-round progression tracking

### 2.5 Intelligent Debate Adaptation
- Agents modify strategy based on opponent strength
- System adjusts round count if debate needs more/less time
- Moderator can request specific topics be addressed
- Fact-checker can pause debate for major corrections
- Judges can request additional rounds if needed for clarity

### 2.6 User Participation
- Vote on winning arguments
- Submit questions for agents to address
- Act as additional human judge
- Request specific angles to be explored
- Pause debate to add clarifications

### 2.7 Debate Library
- Browse past debates by topic, category, or outcome
- Search debates by keywords or themes
- View debate transcripts with full argument history
- See judge scoring and reasoning
- Compare how different AI personas perform

### 2.8 Conclusion Documents
- Comprehensive report of entire debate
- Winning arguments clearly highlighted
- Key points from each perspective
- Areas of factual agreement
- Areas of philosophical disagreement
- Quality scores and judge reasoning
- Sources and references used
- Recommended further reading

---

## 3. System Architecture

### 3.1 High-Level Flow

**Debate Initialization**
- User submits topic via Next.js frontend
- API route validates and creates debate record
- Inngest event triggers orchestrator function
- Orchestrator analyzes topic and decides debate structure
- System spawns appropriate debate agents with assigned positions

**Research Phase**
- All debate agents execute research in parallel
- Agents use tools (web search, academic databases, APIs) autonomously
- Agents decide which sources to trust and incorporate
- Research findings stored for use in arguments

**Debate Execution**
- Orchestrator initiates round sequence
- Each round, agents generate arguments simultaneously
- Moderator analyzes round and provides feedback
- Fact-checker validates claims concurrently
- System determines if additional rounds needed
- Process continues until natural conclusion reached

**Judgment**
- Three judge agents evaluate debate independently
- Each judge uses different evaluation criteria
- If scores are close, judges enter deliberation phase
- Final verdict determined through consensus or majority

**Synthesis**
- Synthesis agent reviews entire debate history
- Generates comprehensive conclusion document
- Identifies key learnings and insights
- Produces balanced final report

### 3.2 Agent Architecture

Each agent operates as an independent Inngest function with:
- **State Management**: Access to full debate history and context
- **Tool Access**: Ability to call external APIs and services
- **Decision Making**: LLM-powered reasoning about next actions
- **Communication**: Event-based messaging with other agents
- **Memory**: Persistent storage of findings and strategy

Agents don't follow scripts—they make decisions dynamically based on:
- Current debate state
- Opponent arguments
- Their assigned position and goals
- Quality of available evidence
- Strategic considerations

### 3.3 Workflow Orchestration

**Orchestrator Pattern**
- Central orchestrator function manages overall debate lifecycle
- Spawns and coordinates all other agents
- Monitors progress and adjusts structure dynamically
- Handles error recovery and fallbacks
- Ensures debate reaches meaningful conclusion

**Event-Driven Communication**
- Agents communicate through Inngest events
- Loose coupling allows independent operation
- Parallel execution where possible
- Sequential execution where dependencies exist

**Adaptive Flow Control**
- System doesn't follow rigid pipeline
- Debate length and structure adapt to topic complexity
- Additional agents spawned as needed
- Rounds can be extended or shortened based on progress

### 3.4 Technology Integration

**Next.js Application**
- Frontend for creating and viewing debates
- API routes for debate management
- Real-time updates via Server-Sent Events or polling
- NextAuth for user authentication and session management

**Inngest Orchestration**
- All agent logic runs as Inngest functions
- Step functions manage multi-stage reasoning
- Fan-out/fan-in patterns for parallel agent execution
- Event system for inter-agent communication
- Built-in retry and error handling

**Database (PostgreSQL + Prisma)**
- Stores debate records and metadata
- Persists agent arguments and findings
- Tracks debate progression and state
- Stores judgments and conclusions
- Maintains user data and preferences

**AI/LLM Integration**
- OpenAI GPT-4 or Anthropic Claude for agent reasoning
- Vercel AI SDK for structured outputs and tool calling
- Different models for different agent types (fast vs deep reasoning)
- Tool calling for agents to use external resources

**External Tools**
- Web search API for research
- Academic database APIs for scholarly sources
- News APIs for current events
- Fact-checking APIs for claim validation

---

## 4. Agent Behaviors and Responsibilities

### 4.1 Debate Agents

**Core Responsibilities**
- Advocate convincingly for assigned position
- Build evidence-based arguments
- Respond strategically to opponent claims
- Adapt argumentation strategy each round

**Decision Points**
- Which tools to use for research
- What evidence is most credible and relevant
- How to structure arguments for maximum impact
- When to attack opponent weaknesses vs defend own position
- Whether to concede minor points to strengthen major ones
- Which logical fallacies opponent is using

**Strategic Behaviors**
- Opening strong with best arguments vs holding back
- Directly refuting opponent vs building independent case
- Using emotional appeal vs pure logic
- Introducing new evidence vs reinforcing existing points
- Collaborative building on other agents vs pure opposition

### 4.2 Moderator Agent

**Core Responsibilities**
- Maintain debate structure and flow
- Ensure arguments stay on-topic
- Identify rule violations and logical errors
- Provide neutral summaries after each round
- Determine when debate has reached conclusion

**Decision Points**
- Whether debate needs more rounds or has exhausted topic
- If agents are addressing topic or getting sidetracked
- When to intervene with corrections vs let debate flow
- If debate quality warrants continuation

**Intervention Triggers**
- Agent makes false claim that wasn't caught by fact-checker
- Arguments become repetitive without new insights
- Agents engage in logical fallacies repeatedly
- Debate reaches natural consensus or clear stalemate

### 4.3 Judge Agents

**Logic Judge**
- Evaluates argument structure and validity
- Identifies sound vs unsound reasoning
- Penalizes logical fallacies
- Rewards clear cause-effect relationships
- Assesses internal consistency

**Evidence Judge**
- Verifies source credibility
- Checks citation quality
- Values peer-reviewed research over opinion
- Considers recency and relevance of evidence
- Evaluates data interpretation accuracy

**Rhetoric Judge**
- Assesses persuasive power
- Evaluates clarity and communication
- Considers emotional resonance appropriately
- Rewards well-structured arguments
- Values accessibility without oversimplification

**Deliberation Process**
- Judges share their evaluations
- Discuss discrepancies in scoring
- Identify which criteria should weigh more for this specific topic
- Reach consensus or agree to disagree with reasoning

### 4.4 Fact-Checker Agent

**Core Responsibilities**
- Monitor all claims made during debate
- Research factual assertions independently
- Provide real-time corrections
- Assign credibility scores to claims

**Verification Process**
- Identify checkable factual claims
- Search authoritative sources
- Cross-reference multiple sources
- Determine claim accuracy (true/false/misleading/unverifiable)
- Provide correction with evidence

**Prioritization**
- Focus on central claims over tangential ones
- Prioritize surprising or counterintuitive claims
- Check statistics and numbers
- Verify historical facts and events

### 4.5 Synthesis Agent

**Core Responsibilities**
- Review entire debate comprehensively
- Extract strongest arguments from all sides
- Identify common ground and disagreements
- Generate balanced conclusion

**Analysis Approach**
- Map argument structure across all rounds
- Identify which claims were contested vs accepted
- Note which rebuttals were effective
- Recognize patterns in reasoning
- Highlight novel insights that emerged

**Conclusion Generation**
- Present each perspective fairly
- Acknowledge strongest points from each side
- Explain why certain arguments won
- Note limitations and uncertainties
- Suggest areas for further exploration

---

## 5. Data Model

### 5.1 Core Entities

**Debate**
- Unique identifier
- Topic and description
- Current status (researching, round 1-N, judging, completed)
- Debate structure configuration
- Timestamps for creation and completion
- Link to creator user
- Final conclusion data
- Overall winner determination

**Debate Agent**
- Unique identifier
- Link to parent debate
- Assigned position (pro, con, neutral, specific perspective)
- Persona/character (The Pragmatist, The Idealist, etc.)
- Research notes and findings
- Current status
- Strategy decisions made

**Argument**
- Unique identifier
- Link to debate and agent
- Round number
- Argument content (claim, supporting points, evidence, rebuttals)
- Strategy used
- References to sources
- Fact-check status
- Timestamp

**Judgment**
- Unique identifier
- Link to debate
- Judge type (logic, evidence, rhetoric)
- Individual agent scores with breakdowns
- Winner selection
- Detailed reasoning
- Confidence level

**Fact Check**
- Unique identifier
- Link to specific argument and claim
- Claim being checked
- Verdict (true, false, misleading, unverifiable)
- Supporting evidence
- Sources used
- Credibility score

**User Vote**
- Link to user and debate
- Selected winner
- Optional reasoning
- Timestamp

### 5.2 Relationships

Debates contain multiple agents, arguments, judgments, and fact-checks. Arguments belong to specific agents and rounds. Fact-checks reference specific arguments. Judgments evaluate the entire debate. Users can create debates and cast votes.

---

## 6. User Journeys

### 6.1 Creating and Watching a Debate

**Initial Submission**
- User navigates to debate creation page
- Enters topic or question
- Optionally specifies debate parameters
- Submits and receives debate ID
- Redirected to live debate view

**Watching Research Phase**
- Sees agents being spawned
- Views agent personas and positions
- Watches research progress indicators
- Sees key sources being gathered

**Following Debate Rounds**
- Arguments appear in real-time as generated
- Each agent's arguments displayed in their column
- Moderator summaries appear centrally
- Fact-check notifications pop up inline
- Round progress indicator shows current stage

**Viewing Judgment**
- Judge evaluations appear when ready
- Scores displayed with detailed breakdowns
- Reasoning from each judge presented
- Overall winner announced

**Reading Conclusion**
- Comprehensive synthesis document generated
- Key arguments highlighted
- Areas of agreement/disagreement noted
- Sources and references provided
- Option to download or share

### 6.2 Participating in Debate

**During Debate**
- User can vote on individual arguments
- Submit questions for agents to address
- Request specific angles be explored
- Pause debate to add context or clarifications

**Post-Debate**
- Cast vote for overall winner
- Write reasoning for vote
- Compare vote with AI judges
- Share debate with others

### 6.3 Browsing Past Debates

**Discovery**
- Browse debates by topic categories
- Search by keywords
- Filter by outcome or controversy level
- Sort by recency, popularity, or closeness

**Exploration**
- Read full debate transcripts
- Jump to specific rounds
- See fact-checks inline
- Review judge reasoning
- Compare with similar debates

---

## 7. Inngest Integration Strategy

### 7.1 Function Organization

**Orchestrator Functions**
- Main debate orchestrator manages overall lifecycle
- Spawns and coordinates all sub-agents
- Monitors progress and adapts structure
- Handles transitions between phases

**Agent Functions**
- Each agent type is a separate Inngest function
- Can be invoked by orchestrator or triggered by events
- Operates independently with access to shared state
- Returns results to orchestrator or emits events

**Coordination Functions**
- Moderator function triggered after each round
- Judge functions invoked during judgment phase
- Synthesis function triggered when debate concludes

### 7.2 Event Flow

**Debate Lifecycle Events**
- `debate/created` - Triggers orchestrator
- `debate/research-phase-started` - Agents begin research
- `debate/round-started` - New round begins
- `debate/round-completed` - All arguments submitted
- `debate/ready-for-judgment` - Debate concluded
- `debate/judgment-completed` - All judges scored
- `debate/completed` - Final synthesis done

**Agent Communication Events**
- `agent/research-completed` - Agent finished gathering evidence
- `agent/argument-posted` - New argument available
- `agent/challenge-issued` - Agent challenges opponent claim
- `fact-check/completed` - Claim verified
- `moderator/intervention` - Moderator issues correction

### 7.3 Agentic Patterns

**Dynamic Agent Spawning**
- Orchestrator decides how many agents to spawn
- Can spawn additional agents mid-debate if needed
- Agents assigned positions based on topic analysis

**Adaptive Workflow Control**
- Number of rounds not predetermined
- Debate continues until natural conclusion
- Moderator can extend or shorten as needed
- System responds to debate quality and progress

**Parallel Execution with Dependencies**
- Research phase: all agents work in parallel
- Argument generation: agents work simultaneously
- Fact-checking: runs concurrent with arguments
- Judgment: judges evaluate independently then deliberate

**Step Functions for Complex Reasoning**
- Multi-step research: search → evaluate → incorporate
- Argument construction: analyze → strategize → compose
- Judgment: evaluate individually → compare → deliberate

**Wait Patterns for Coordination**
- Wait for all agents to complete research before starting debate
- Wait for all arguments in round before moderator analysis
- Wait for all judges before synthesis
- Wait for human input if user participation enabled

### 7.4 Error Handling and Resilience

**Retry Strategies**
- LLM calls retry up to 3 times with exponential backoff
- External API calls retry with different queries if initial fails
- Agent failures trigger fallback strategies

**Fallback Behaviors**
- If agent fails repeatedly, orchestrator adjusts debate structure
- If fact-checker unavailable, debate continues with warning
- If judge fails, remaining judges proceed
- If synthesis fails, basic summary generated from raw data

**State Management**
- All agent decisions and reasoning persisted
- Debate can be paused and resumed
- Failed runs can be replayed from last checkpoint

---

## 8. Design Principles

### 8.1 True Agent Autonomy

Agents make real decisions, they don't follow scripts. Every action results from LLM reasoning about current state. Agents choose their own strategies, tools, and approaches.

### 8.2 Emergence Over Prescription

The system creates conditions for interesting debates to emerge rather than forcing predetermined outcomes. Debate structure adapts to content, not vice versa.

### 8.3 Quality Over Speed

Debates take time to develop properly. The system prioritizes thoughtful arguments over rapid responses. Agents research thoroughly and reason deeply.

### 8.4 Balance and Fairness

All positions receive equal opportunity to argue. Moderator maintains neutrality. Judges evaluate independently. Synthesis presents all sides fairly.

### 8.5 Transparency

All agent reasoning visible to users. Decision points explained. Sources cited. Process observable in real-time.

### 8.6 Extensibility

Easy to add new agent types, debate formats, and evaluation criteria. System designed for expansion and experimentation.

---

## 9. Technical Considerations

### 9.1 Real-Time Updates

Frontend receives updates as debate progresses. Server-Sent Events or polling provides live argument stream. Users see debate unfold naturally.

### 9.2 LLM Cost Management

Different models for different tasks. Fast models for simple decisions. Powerful models for complex reasoning. Caching of common research queries. Rate limiting on expensive operations.

### 9.3 Scalability

Each debate runs independently. Multiple debates can run concurrently. Agent functions scale horizontally. Database optimized for read-heavy workload.

### 9.4 Debate Quality Control

Moderator ensures arguments stay substantive. Fact-checker prevents misinformation. Judges reward quality over quantity. System learns from successful debate patterns.

### 9.5 User Authentication

NextAuth provides GitHub or Google OAuth. Users own their debates. Authentication required for creation, optional for viewing. User votes and participation tracked.

---

## 10. Future Expansion Possibilities

### 10.1 Additional Debate Formats
- Team debates (2v2 or 3v3)
- Parliamentary style with multiple parties
- Lincoln-Douglas format
- Public forum with audience interaction
- Fishbowl discussions

### 10.2 Human Participation
- Human vs AI debates
- Human as moderator or judge
- Audience voting affects debate direction
- User can represent specific position

### 10.3 Tournament Mode
- Multiple debates on related topics
- Winning arguments advance
- Champion perspectives identified
- Cross-debate synthesis

### 10.4 Learning and Improvement
- Track which argument styles win most
- Identify effective debate strategies
- Learn from user voting patterns
- Improve agent personas over time

### 10.5 Specialized Agents
- Domain expert agents (economics, science, ethics)
- Devil's advocate agent
- Socratic questioner agent
- Historical perspective agent

### 10.6 Advanced Features
- Multi-language debates
- Visual argument mapping
- Argument strength visualization
- Export to academic formats
- Integration with research tools

---

## 11. Success Criteria

### 11.1 Functional Success
- Debates reach meaningful conclusions
- Arguments are substantive and evidence-based
- Agents demonstrate adaptive behavior
- Fact-checking catches false claims
- Judgments are fair and well-reasoned

### 11.2 Technical Success
- System handles multiple concurrent debates
- Real-time updates work smoothly
- Inngest orchestration manages complexity
- Error handling prevents debate failures
- Performance remains acceptable as debates grow

### 11.3 User Engagement
- Users find debates insightful
- Conclusions provide genuine value
- Users return to create more debates
- Debates generate interesting discussions
- Users share debates with others

---

## 12. Project Scope Summary

### 12.1 Included
- Topic submission and debate creation
- Autonomous multi-agent debate system
- Research, argument, judgment, and synthesis phases
- Moderator and fact-checker agents
- Real-time debate viewing
- Comprehensive conclusion documents
- User authentication and debate library
- Full Inngest orchestration

### 12.2 Out of Scope (for initial version)
- Voice/audio debates
- Video generation
- Mobile apps
- Advanced analytics dashboards
- Monetization features
- Social media integration
- Public API access
- Administrative tools beyond basic moderation

---

This design provides a focused, achievable project that demonstrates true agentic behavior through multi-agent collaboration while remaining testable and engaging. The system is complex enough to showcase Inngest's power but scoped appropriately for a learning project.
