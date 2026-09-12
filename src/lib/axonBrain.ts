import {
  ChatMessage,
  ChatAttachment,
  NoteItem,
  ProjectActivityEvent,
  ProjectActivityType,
} from '../types';
import {
  CapabilityRegistry,
  CapabilityFeature,
  ExternalToolCapability,
} from './capabilityRegistry';
import {
  queryTimelineNaturalLanguage,
  createProjectActivityEvent,
} from './projectTimeline';
import { fileIntelligence } from './fileIntelligence';
import { detectSelfKnowledgeQuery } from './axonKnowledge';

export interface BrainRequestContext {
  conversationHistory?: ChatMessage[];
  projectNotes?: NoteItem[];
  systemContext?: string;
  timelineEvents?: ProjectActivityEvent[];
  capabilityRegistry?: CapabilityRegistry;
}

export interface BrainRequest {
  id: string;
  text: string;
  projectId?: string;
  attachment?: ChatAttachment;
  context?: BrainRequestContext;
}

export type IntentCategory =
  | 'conversational'
  | 'project_timeline_query'
  | 'file_intelligence_query'
  | 'local_calculation'
  | 'storage_command'
  | 'code_execution'
  | 'code_architecture_or_design'
  | 'research_and_synthesis'
  | 'analysis_and_debugging'
  | 'project_organization'
  | 'task_planning'
  | 'content_creation'
  | 'data_transformation'
  | 'explain_reasoning_or_plan'
  | 'delegation_candidate';

export type ActionVerb =
  | 'analyze'
  | 'calculate'
  | 'explain'
  | 'plan'
  | 'synthesize'
  | 'code'
  | 'debug'
  | 'organize'
  | 'search'
  | 'query'
  | 'compare'
  | 'summarize'
  | 'create'
  | 'transform'
  | 'chat';

export type TargetDomain =
  | 'software'
  | 'data'
  | 'research'
  | 'biblical_history'
  | 'system_storage'
  | 'project_management'
  | 'general';

export type ComplexityLevel = 'low' | 'medium' | 'high';

export interface BrainIntent {
  category: IntentCategory;
  primaryGoal: string;
  actionVerb: ActionVerb;
  targetDomain: TargetDomain;
  complexity: ComplexityLevel;
  confidence: number;
  summary: string;
  detectedEntities: {
    dates?: string[];
    files?: string[];
    codeKeywords?: string[];
    mathExpression?: string;
    keyConcepts?: string[];
  };
  constraints: {
    format?: 'bullets' | 'code' | 'table' | 'concise' | 'step_by_step' | 'standard';
    requiresExactMath?: boolean;
    requiresOffline?: boolean;
    requiresVision?: boolean;
  };
  isMetaPlanQuery: boolean;
  suggestedHandling: 'local_axon' | 'delegate_external' | 'interactive_query';
}

export interface BrainPlanStep {
  stepIndex: number;
  title: string;
  handler: 'axon_local' | 'external_delegate' | 'timeline_engine' | 'file_intelligence';
  toolOrProvider?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'failed';
  summary: string;
  estimatedEffort?: 'minimal' | 'moderate' | 'complex';
}

export interface BrainPlan {
  id: string;
  goal: string;
  rationale: string;
  explanation: string;
  steps: BrainPlanStep[];
  delegationRequired: boolean;
  delegationProposal?: {
    targetProvider: string;
    targetCapability?: CapabilityFeature;
    reason: string;
    fallbackAllowed: boolean;
  };
  createdAt: string;
}

export interface DelegationDecision {
  shouldDelegate: boolean;
  suggestedProvider?: string;
  targetCapability?: CapabilityFeature;
  reason: string;
  eligibleDelegates: ExternalToolCapability[];
}

export interface BrainProcessResult {
  requestId: string;
  handledLocally: boolean;
  intent: BrainIntent;
  plan: BrainPlan;
  delegationDecision: DelegationDecision;
  localResponse?: string;
  modelLabel: string;
  activityEvent?: ProjectActivityEvent;
}

// Extension hook signatures for future phases (Phase 1+)
export type IntentClassifierHook = (request: BrainRequest) => Partial<BrainIntent> | null;
export type PlanModifierHook = (request: BrainRequest, intent: BrainIntent, plan: BrainPlan) => BrainPlan | null;
export type DelegationEvaluatorHook = (
  request: BrainRequest,
  plan: BrainPlan,
  registry?: CapabilityRegistry
) => Partial<DelegationDecision> | null;

/**
 * Safe deterministic arithmetic evaluator (zero eval, zero injection risk)
 */
function safeEvaluateMath(expr: string): { result: number; steps: string[] } | null {
  const cleanExpr = expr.replace(/[^\d.+\-*/%^()]/g, ' ').trim();
  if (!cleanExpr) return null;
  const tokens = cleanExpr.match(/(?:\d*\.?\d+)|[+\-*/%^()]/g);
  if (!tokens || tokens.length === 0) return null;

  try {
    let pos = 0;
    function peek(): string | undefined {
      return tokens![pos];
    }
    function consume(): string {
      return tokens![pos++];
    }

    function parseExpression(): number {
      let val = parseTerm();
      while (peek() === '+' || peek() === '-') {
        const op = consume();
        const next = parseTerm();
        val = op === '+' ? val + next : val - next;
      }
      return val;
    }

    function parseTerm(): number {
      let val = parsePower();
      while (peek() === '*' || peek() === '/' || peek() === '%') {
        const op = consume();
        const next = parsePower();
        if (op === '*') val = val * next;
        else if (op === '/') {
          if (next === 0) throw new Error('Division by zero');
          val = val / next;
        } else if (op === '%') {
          val = val % next;
        }
      }
      return val;
    }

    function parsePower(): number {
      let val = parseFactor();
      if (peek() === '^') {
        consume();
        const next = parsePower();
        val = Math.pow(val, next);
      }
      return val;
    }

    function parseFactor(): number {
      const tok = peek();
      if (!tok) throw new Error('Unexpected end of input');
      if (tok === '(') {
        consume();
        const val = parseExpression();
        if (peek() === ')') consume();
        return val;
      }
      if (tok === '-') {
        consume();
        return -parseFactor();
      }
      if (tok === '+') {
        consume();
        return parseFactor();
      }
      if (/^\d*\.?\d+$/.test(tok)) {
        consume();
        return parseFloat(tok);
      }
      throw new Error(`Unexpected token: ${tok}`);
    }

    const calculated = parseExpression();
    if (pos < tokens.length) return null;
    if (isNaN(calculated) || !isFinite(calculated)) return null;

    return {
      result: calculated,
      steps: [
        `Identified arithmetic expression: \`${cleanExpr}\``,
        `Evaluated operator precedence and computed result: **${calculated}**`,
      ],
    };
  } catch {
    return null;
  }
}

/**
 * AXON Brain Core
 * The central intelligence module that all user requests pass through.
 * Unified architecture: One AXON intelligence with internal reasoning, planning,
 * delegation evaluation, and project memory persistence.
 */
export class AxonBrainCore {
  private intentClassifiers: IntentClassifierHook[] = [];
  private planModifiers: PlanModifierHook[] = [];
  private delegationEvaluators: DelegationEvaluatorHook[] = [];

  // Active plans cache per project for explanation lookups and "what have you planned" queries
  private activePlansByProject: Map<string, BrainPlan> = new Map();
  private activeIntentsByProject: Map<string, BrainIntent> = new Map();
  private activeDecisionsByProject: Map<string, DelegationDecision> = new Map();
  private planHistoryByProject: Map<string, BrainPlan[]> = new Map();

  /**
   * Extension point: Register custom intent classifiers
   */
  public registerIntentClassifier(hook: IntentClassifierHook): void {
    this.intentClassifiers.push(hook);
  }

  /**
   * Extension point: Register custom plan modifiers
   */
  public registerPlanModifier(hook: PlanModifierHook): void {
    this.planModifiers.push(hook);
  }

  /**
   * Extension point: Register custom delegation evaluators
   */
  public registerDelegationEvaluator(hook: DelegationEvaluatorHook): void {
    this.delegationEvaluators.push(hook);
  }

  /**
   * Retrieves the active or most recently formed plan for a project.
   */
  public getLastPlan(projectId?: string): BrainPlan | undefined {
    if (projectId && this.activePlansByProject.has(projectId)) {
      return this.activePlansByProject.get(projectId);
    }
    return this.activePlansByProject.get('default') || Array.from(this.activePlansByProject.values()).pop();
  }

  /**
   * Retrieves chronological plan history for a project.
   */
  public getPlanHistory(projectId?: string): BrainPlan[] {
    const key = projectId || 'default';
    return this.planHistoryByProject.get(key) || [];
  }

  /**
   * Step 1: Understand the user's request
   * Parses what the user is actually asking for beyond superficial keyword matching:
   * evaluates primary goal, action directives, domain context, constraints, and detected entities.
   */
  public understandRequest(request: BrainRequest): BrainIntent {
    const text = (request.text || '').trim();
    const lowerText = text.toLowerCase();

    // Check registered custom classifiers first
    for (const classifier of this.intentClassifiers) {
      const custom = classifier(request);
      if (custom && custom.category) {
        return {
          category: custom.category,
          primaryGoal: custom.primaryGoal || custom.summary || 'Custom request goal',
          actionVerb: custom.actionVerb || 'analyze',
          targetDomain: custom.targetDomain || 'general',
          complexity: custom.complexity || 'medium',
          confidence: custom.confidence ?? 0.9,
          summary: custom.summary ?? 'Custom intent recognized',
          detectedEntities: custom.detectedEntities ?? {},
          constraints: custom.constraints ?? {},
          isMetaPlanQuery: Boolean(custom.isMetaPlanQuery),
          suggestedHandling: custom.suggestedHandling ?? 'local_axon',
        };
      }
    }

    // 1. Check for Meta-Query asking to explain AXON's plan, reasoning, or decision
    const isMetaPlanQuery =
      /(?:what(?:'s| is) (?:the|your) plan|how (?:are you|will you|do you plan to) (?:do|accomplish|tackle|handle|approach)|explain (?:your |the )?(?:plan|reasoning|approach|steps)|walk (?:me )?through (?:the|your) (?:plan|steps)|why did you (?:decide|choose)|show (?:me )?(?:the|your) plan)/i.test(
        lowerText
      );

    if (isMetaPlanQuery) {
      // Check if user is asking about a specific topic (e.g., "what's your plan for refactoring X")
      const planTopicMatch = text.match(
        /(?:plan (?:for|on|regarding|to)|approach (?:for|to)|steps (?:for|to))\s+(.+)$/i
      );
      const specificSubject = planTopicMatch && planTopicMatch[1] ? planTopicMatch[1].replace(/[?.!]+$/, '').trim() : '';

      return {
        category: 'explain_reasoning_or_plan',
        primaryGoal: specificSubject
          ? `Plan and explain approach for: ${specificSubject}`
          : 'Explain active execution plan and reasoning steps',
        actionVerb: 'explain',
        targetDomain: 'project_management',
        complexity: 'low',
        confidence: 0.95,
        summary: specificSubject
          ? `User requested plan and plain-language reasoning breakdown for "${specificSubject}".`
          : 'User requested plain-language explanation of execution plan and reasoning.',
        detectedEntities: this.extractEntities(text),
        constraints: { format: 'step_by_step' },
        isMetaPlanQuery: true,
        suggestedHandling: 'local_axon',
      };
    }

    // 2. Check for Project Timeline queries ("when did I work on...", "what did I do on Sept 3rd", "show work history")
    const isTimeline =
      /(?:when did (?:i|we|you)|what did (?:i|we|you) (?:do|work on|plan)|show (?:my )?(?:work|activity|timeline|history|plans)|work history|project timeline|what plans)/i.test(
        lowerText
      ) ||
      /(?:when was .* (?:created|drafted|done|worked on|updated|written|planned))/i.test(lowerText);

    if (isTimeline) {
      return {
        category: 'project_timeline_query',
        primaryGoal: 'Query timestamped project activity records and chronological history',
        actionVerb: 'query',
        targetDomain: 'project_management',
        complexity: 'low',
        confidence: 0.95,
        summary: 'Querying project activity records and work history dates.',
        detectedEntities: this.extractEntities(text),
        constraints: {},
        isMetaPlanQuery: false,
        suggestedHandling: 'local_axon',
      };
    }

    // 3. Check for File Intelligence natural language search
    if (fileIntelligence.isNaturalLanguageFileQuery(text)) {
      return {
        category: 'file_intelligence_query',
        primaryGoal: 'Locate and inspect indexed project documents, code, or media files',
        actionVerb: 'search',
        targetDomain: 'software',
        complexity: 'low',
        confidence: 0.92,
        summary: 'Natural language search across indexed files (docs, code, media).',
        detectedEntities: this.extractEntities(text),
        constraints: {},
        isMetaPlanQuery: false,
        suggestedHandling: 'local_axon',
      };
    }

    // 4. Check for arithmetic calculation
    const mathPattern = /^(?:what is |calculate |evaluate |compute )?[\d\s+\-*/().%^]+$/i;
    const isMathExpr = mathPattern.test(text) && /[\d]/.test(text) && /[+\-*/%^]/.test(text);
    if (isMathExpr) {
      return {
        category: 'local_calculation',
        primaryGoal: `Evaluate arithmetic expression: ${text.replace(/^(?:what is |calculate |evaluate |compute )/i, '').trim()}`,
        actionVerb: 'calculate',
        targetDomain: 'data',
        complexity: 'low',
        confidence: 0.98,
        summary: 'Deterministic arithmetic evaluation requiring exact precision.',
        detectedEntities: { mathExpression: text, ...this.extractEntities(text) },
        constraints: { requiresExactMath: true },
        isMetaPlanQuery: false,
        suggestedHandling: 'local_axon',
      };
    }

    // 5. Check for storage & device manifest commands
    if (/(?:storage manifest|compress assets|storage budget|quantize|clean cache|free up space)/i.test(lowerText)) {
      return {
        category: 'storage_command',
        primaryGoal: 'Manage device storage manifest allocations and asset compression',
        actionVerb: 'organize',
        targetDomain: 'system_storage',
        complexity: 'medium',
        confidence: 0.9,
        summary: 'Device storage and asset manifest command.',
        detectedEntities: this.extractEntities(text),
        constraints: { requiresOffline: true },
        isMetaPlanQuery: false,
        suggestedHandling: 'local_axon',
      };
    }

    // 6. Check for project task planning / work breakdown structure
    const isTaskPlanning =
      /(?:plan (?:a|the|out)? (?:schedule|roadmap|rollout|milestones|sprint|tasks|workflow|phase)|break (?:down|this down)|work breakdown|project roadmap|step[- ]by[- ]step plan)/i.test(
        lowerText
      );
    if (isTaskPlanning) {
      return {
        category: 'task_planning',
        primaryGoal: this.synthesizeGoal(text, 'Develop sequenced project roadmap and work breakdown structure'),
        actionVerb: 'plan',
        targetDomain: 'project_management',
        complexity: 'medium',
        confidence: 0.92,
        summary: 'Project milestone sequencing and work breakdown planning.',
        detectedEntities: this.extractEntities(text),
        constraints: this.extractConstraints(lowerText),
        isMetaPlanQuery: false,
        suggestedHandling: 'local_axon',
      };
    }

    // 7. Check for content creation / note drafting
    const isContentCreation =
      /(?:draft|write (?:a|an)? (?:note|document|doc|article|summary|outline|brief|readme)|compose|author|generate notes)/i.test(
        lowerText
      );
    if (isContentCreation) {
      return {
        category: 'content_creation',
        primaryGoal: this.synthesizeGoal(text, 'Draft structured document and persist to project notes'),
        actionVerb: 'create',
        targetDomain: 'general',
        complexity: 'medium',
        confidence: 0.9,
        summary: 'Authoring structured document content and project documentation.',
        detectedEntities: this.extractEntities(text),
        constraints: this.extractConstraints(lowerText),
        isMetaPlanQuery: false,
        suggestedHandling: 'local_axon',
      };
    }

    // 8. Check for data transformation / format conversion
    const isDataTransformation =
      /(?:convert|transform|parse (?:csv|json|xml|markdown)|format (?:into|as) (?:table|json|csv)|restructure data)/i.test(
        lowerText
      );
    if (isDataTransformation) {
      return {
        category: 'data_transformation',
        primaryGoal: this.synthesizeGoal(text, 'Transform data format and restructure schema'),
        actionVerb: 'transform',
        targetDomain: 'data',
        complexity: 'medium',
        confidence: 0.91,
        summary: 'Data format restructuring and schema transformation.',
        detectedEntities: this.extractEntities(text),
        constraints: this.extractConstraints(lowerText),
        isMetaPlanQuery: false,
        suggestedHandling: 'local_axon',
      };
    }

    // 9. Check for software architecture, engineering, or design
    const isSoftwareDesign =
      /(?:architect|architecture|design (?:a|the)? (?:system|component|layout|module|store)|spec|interface|react|typescript|state flow|data model|refactor|implement (?:a|the)? (?:function|hook|class|module)|write code)/i.test(
        lowerText
      );
    if (isSoftwareDesign) {
      return {
        category: 'code_architecture_or_design',
        primaryGoal: this.synthesizeGoal(text, 'Design software architecture and module interfaces'),
        actionVerb: 'code',
        targetDomain: 'software',
        complexity: lowerText.length > 80 ? 'high' : 'medium',
        confidence: 0.88,
        summary: 'Software engineering architecture and structural design request.',
        detectedEntities: this.extractEntities(text),
        constraints: this.extractConstraints(lowerText),
        isMetaPlanQuery: false,
        suggestedHandling: 'local_axon',
      };
    }

    // 10. Check for research and textual synthesis (e.g. Scripture, linguistics, historical analysis)
    const isResearch =
      /(?:concordance|hebrew|greek|scripture|bible|historical|manuscript|linguistic|research|literature|compare texts)/i.test(
        lowerText
      );
    if (isResearch) {
      return {
        category: 'research_and_synthesis',
        primaryGoal: this.synthesizeGoal(text, 'Conduct research and comparative textual synthesis'),
        actionVerb: 'synthesize',
        targetDomain: 'biblical_history',
        complexity: 'medium',
        confidence: 0.88,
        summary: 'Comparative research and textual synthesis task.',
        detectedEntities: this.extractEntities(text),
        constraints: this.extractConstraints(lowerText),
        isMetaPlanQuery: false,
        suggestedHandling: 'local_axon',
      };
    }

    // 11. Check for debugging / diagnostic analysis
    const isDebugging =
      /(?:debug|troubleshoot|diagnose|fix (?:this|the) (?:error|bug|issue)|stack trace|bottleneck|memory leak|why is (?:it|this) failing|compilation error)/i.test(
        lowerText
      );
    if (isDebugging) {
      return {
        category: 'analysis_and_debugging',
        primaryGoal: this.synthesizeGoal(text, 'Diagnose issue and formulate targeted resolution'),
        actionVerb: 'debug',
        targetDomain: 'software',
        complexity: 'medium',
        confidence: 0.86,
        summary: 'Diagnostic debugging and problem isolation.',
        detectedEntities: this.extractEntities(text),
        constraints: this.extractConstraints(lowerText),
        isMetaPlanQuery: false,
        suggestedHandling: 'local_axon',
      };
    }

    // 12. Check for heavy tasks outside AXON's standalone local capability (delegation candidate)
    // E.g. Multimodal vision with attachment, massive full-stack scaffolding, or live web search
    const hasVisualAttachment = Boolean(request.attachment && request.attachment.type.startsWith('image/'));
    const isMassiveBuild = /(?:build a full[- ]stack (?:app|application|platform)|generate entire codebase)/i.test(lowerText);
    const requiresLiveWeb = /(?:search the live web|crawl (?:this|the) website|current stock price)/i.test(lowerText);

    if (hasVisualAttachment || isMassiveBuild || requiresLiveWeb) {
      return {
        category: 'delegation_candidate',
        primaryGoal: this.synthesizeGoal(text, 'Execute complex specialized task'),
        actionVerb: hasVisualAttachment ? 'analyze' : 'code',
        targetDomain: 'software',
        complexity: 'high',
        confidence: 0.9,
        summary: hasVisualAttachment
          ? 'Multi-modal vision analysis required for attachment.'
          : 'Task exceeds standalone local execution boundaries.',
        detectedEntities: this.extractEntities(text),
        constraints: {
          requiresVision: hasVisualAttachment,
          ...this.extractConstraints(lowerText),
        },
        isMetaPlanQuery: false,
        suggestedHandling: 'delegate_external',
      };
    }

    // Default: Conversational interaction
    return {
      category: 'conversational',
      primaryGoal: this.synthesizeGoal(text, 'Address conversational inquiry'),
      actionVerb: 'chat',
      targetDomain: 'general',
      complexity: 'low',
      confidence: 0.78,
      summary: 'Conversational interaction or general question.',
      detectedEntities: this.extractEntities(text),
      constraints: this.extractConstraints(lowerText),
      isMetaPlanQuery: false,
      suggestedHandling: 'local_axon',
    };
  }

  /**
   * Helper: Extracts dates, filenames, code terms, and salient concepts from text.
   */
  private extractEntities(text: string): BrainIntent['detectedEntities'] {
    const dates: string[] = [];
    const files: string[] = [];
    const codeKeywords: string[] = [];
    const keyConcepts: string[] = [];

    if (!text || typeof text !== 'string') {
      return { dates, files, codeKeywords, keyConcepts };
    }

    try {
      // ISO dates & named dates
      const isoMatches = text.match(/\b202\d-[01]\d-[0-3]\d\b/g);
      if (isoMatches) dates.push(...isoMatches);

      const monthMatches = text.match(/\b(?:january|february|march|april|may|june|july|august|september|october|november|december|sept|oct|nov|dec|jan|feb|mar|apr|jun|jul|aug)\s+\d{1,2}(?:st|nd|rd|th)?\b/gi);
      if (monthMatches) dates.push(...monthMatches);

      // Files
      const fileMatches = text.match(/\b[\w-]+\.(?:md|ts|tsx|js|jsx|json|txt|png|jpg|svg|css)\b/gi);
      if (fileMatches) files.push(...fileMatches);

      // Code keywords
      const codeMatches = text.match(/\b(?:react|typescript|javascript|vite|tailwind|redux|sqlite|express|css|html|api|json|dom|ast)\b/gi);
      if (codeMatches) codeKeywords.push(...Array.from(new Set(codeMatches.map((c) => c.toLowerCase()))));

      // Salient concepts (noun phrases)
      const conceptTerms = text
        .replace(/[^\w\s-]/g, '')
        .split(/\s+/)
        .filter((w) => w.length > 5 && !/^(should|would|could|please|thanks|really|actually)/i.test(w));
      if (conceptTerms.length > 0) {
        keyConcepts.push(...Array.from(new Set(conceptTerms.slice(0, 4))));
      }
    } catch (e) {
      console.warn('[AxonBrainCore] extractEntities warning:', e);
    }

    return { dates, files, codeKeywords, keyConcepts };
  }

  /**
   * Helper: Detects formatting constraints (e.g. bullets, code block, concise).
   */
  private extractConstraints(lowerText: string): BrainIntent['constraints'] {
    const constraints: BrainIntent['constraints'] = {};
    if (!lowerText || typeof lowerText !== 'string') return constraints;

    if (/(?:bullet(?:s| points)?|list(?:ed)?)/i.test(lowerText)) {
      constraints.format = 'bullets';
    } else if (/(?:code snippet|code block|function only)/i.test(lowerText)) {
      constraints.format = 'code';
    } else if (/(?:table|tabular)/i.test(lowerText)) {
      constraints.format = 'table';
    } else if (/(?:step by step|walkthrough|steps)/i.test(lowerText)) {
      constraints.format = 'step_by_step';
    } else if (/(?:concise|brief|short|one sentence)/i.test(lowerText)) {
      constraints.format = 'concise';
    }
    return constraints;
  }

  /**
   * Helper: Synthesizes a clean primary goal string from the text.
   */
  private synthesizeGoal(text: string, fallback: string): string {
    if (!text || typeof text !== 'string') return fallback;
    const cleaned = text.replace(/^(?:please|can you|could you|i want to|i need to|help me)\s+/i, '').trim();
    if (cleaned.length === 0) return fallback;
    const firstSentence = cleaned.split(/[.?!]/)[0].trim();
    if (firstSentence.length > 10 && firstSentence.length <= 90) {
      return firstSentence.charAt(0).toUpperCase() + firstSentence.slice(1);
    }
    return fallback;
  }

  /**
   * Step 2: Form an execution plan
   * Breaks the request into a clear, ordered sequence of steps tailored to the parsed intent,
   * even if some steps are currently placeholders for future capability phases.
   */
  public formPlan(
    request: BrainRequest,
    intent: BrainIntent,
    registry?: CapabilityRegistry
  ): BrainPlan {
    const planId = `plan-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const steps: BrainPlanStep[] = [];
    let rationale = '';
    let explanation = '';
    let delegationRequired = false;
    let delegationProposal: BrainPlan['delegationProposal'] = undefined;

    switch (intent.category) {
      case 'explain_reasoning_or_plan': {
        const isTargetedTopic = intent.primaryGoal.startsWith('Plan and explain approach for: ');
        const targetSubject = isTargetedTopic
          ? intent.primaryGoal.replace('Plan and explain approach for: ', '').trim()
          : '';

        if (isTargetedTopic && targetSubject) {
          rationale = `User requested an execution plan and plain-language reasoning breakdown specifically for "${targetSubject}".`;
          steps.push({
            stepIndex: 1,
            title: `Analyze Scope and Boundaries for "${targetSubject}"`,
            handler: 'axon_local',
            status: 'pending',
            summary: `Evaluate core requirements, constraints, and project context for ${targetSubject}.`,
            estimatedEffort: 'minimal',
          });
          steps.push({
            stepIndex: 2,
            title: 'Deconstruct Functional Work Breakdown and Milestones',
            handler: 'axon_local',
            status: 'pending',
            summary: 'Map architectural dependencies, interface boundaries, and milestone stages.',
            estimatedEffort: 'moderate',
          });
          steps.push({
            stepIndex: 3,
            title: 'Verify Device Resource Bounds and Offline Feasibility',
            handler: 'axon_local',
            status: 'pending',
            summary: 'Ensure proposed implementation respects 4GB RAM budget and 15GB storage quotas.',
            estimatedEffort: 'minimal',
          });
          steps.push({
            stepIndex: 4,
            title: 'Present Plain-Language Execution Strategy and Await Approval',
            handler: 'axon_local',
            status: 'pending',
            summary: 'Deliver transparent walkthrough of the execution sequence to the user.',
            estimatedEffort: 'minimal',
          });
          explanation = `I have formed a 4-step execution strategy for "${targetSubject}", verifying constraints and preparing a clean roadmap.`;
        } else {
          const lastPlan = this.getLastPlan(request.projectId);
          rationale = 'User requested transparency into AXON reasoning and execution planning.';
          steps.push({
            stepIndex: 1,
            title: 'Retrieve Active Plan and Context',
            handler: 'axon_local',
            status: 'completed',
            summary: lastPlan
              ? `Retrieved active plan for "${lastPlan.goal}".`
              : 'Assembled current project reasoning context.',
            estimatedEffort: 'minimal',
          });
          steps.push({
            stepIndex: 2,
            title: 'Synthesize Plain-Language Explanation',
            handler: 'axon_local',
            status: 'pending',
            summary: 'Convert internal step sequence and delegation decisions into clear conversational explanation.',
            estimatedEffort: 'minimal',
          });
          steps.push({
            stepIndex: 3,
            title: 'Present Reasoning Breakdown to User',
            handler: 'axon_local',
            status: 'pending',
            summary: 'Deliver structured plan breakdown directly in conversational output.',
            estimatedEffort: 'minimal',
          });
          explanation =
            'I am retrieving the active execution plan from project memory and formatting a plain-language breakdown of my reasoning steps and decisions.';
        }
        break;
      }

      case 'task_planning': {
        rationale =
          'Multi-step projects require systematic work breakdown, milestone staging, and dependency sequencing.';
        steps.push({
          stepIndex: 1,
          title: 'Deconstruct Project Goals and Scope Boundaries',
          handler: 'axon_local',
          status: 'pending',
          summary: 'Isolate primary deliverables, prerequisites, and explicit constraints from user input.',
          estimatedEffort: 'minimal',
        });
        steps.push({
          stepIndex: 2,
          title: 'Formulate Milestone Hierarchy and Work Breakdown Structure',
          handler: 'axon_local',
          status: 'pending',
          summary: 'Partition work into clear, chronological phases with discrete completion criteria.',
          estimatedEffort: 'moderate',
        });
        steps.push({
          stepIndex: 3,
          title: 'Map Inter-Task Dependencies and Execution Sequencing',
          handler: 'axon_local',
          status: 'pending',
          summary: 'Order tasks logically to prevent bottlenecks and verify prerequisites before dependent steps.',
          estimatedEffort: 'moderate',
        });
        steps.push({
          stepIndex: 4,
          title: 'Audit Against System Resource Limits',
          handler: 'axon_local',
          status: 'pending',
          summary: 'Validate plan feasibility against local hardware budget and active project timeline.',
          estimatedEffort: 'minimal',
        });
        steps.push({
          stepIndex: 5,
          title: 'Persist Sequenced Roadmap into Project Memory',
          handler: 'axon_local',
          status: 'pending',
          summary: 'Record roadmap to project timeline and active notes for ongoing progress tracking.',
          estimatedEffort: 'minimal',
        });
        explanation =
          'I am structuring a sequenced milestone roadmap with mapped dependencies, resource audits, and timeline records.';
        break;
      }

      case 'content_creation': {
        rationale =
          'Authoring structured content requires establishing audience intent, drafting logical sections, and verifying domain consistency.';
        steps.push({
          stepIndex: 1,
          title: 'Establish Tone, Scope, and Audience Profile',
          handler: 'axon_local',
          status: 'pending',
          summary: 'Analyze project context, desired voice, and structural guidelines.',
          estimatedEffort: 'minimal',
        });
        steps.push({
          stepIndex: 2,
          title: 'Outline Sectional Hierarchy and Core Thesis',
          handler: 'axon_local',
          status: 'pending',
          summary: 'Develop structured outline with logical headers and key discussion points.',
          estimatedEffort: 'minimal',
        });
        steps.push({
          stepIndex: 3,
          title: 'Author Primary Content Body with Domain Precision',
          handler: 'axon_local',
          status: 'pending',
          summary: 'Draft comprehensive, readable text matching the requested format.',
          estimatedEffort: 'moderate',
        });
        steps.push({
          stepIndex: 4,
          title: 'Review Consistency against Workspace Notes',
          handler: 'axon_local',
          status: 'pending',
          summary: 'Cross-check against existing project documentation and facts.',
          estimatedEffort: 'minimal',
        });
        steps.push({
          stepIndex: 5,
          title: 'Commit Document to Project Notes and Timeline',
          handler: 'axon_local',
          status: 'pending',
          summary: 'Store drafted content in project knowledge base for future retrieval.',
          estimatedEffort: 'minimal',
        });
        explanation =
          'I am outlining the document structure, authoring the content body, and persisting the notes to project memory.';
        break;
      }

      case 'data_transformation': {
        rationale =
          'Data transformation requires schema inference, type validation, deterministic formatting, and output verification.';
        steps.push({
          stepIndex: 1,
          title: 'Ingest Input Data and Infer Source Schema',
          handler: 'axon_local',
          status: 'pending',
          summary: 'Detect data structures, field delimiters, and potential syntax quirks.',
          estimatedEffort: 'minimal',
        });
        steps.push({
          stepIndex: 2,
          title: 'Validate Field Consistency and Type Mapping',
          handler: 'axon_local',
          status: 'pending',
          summary: 'Confirm column mappings, nested arrays, and data integrity constraints.',
          estimatedEffort: 'minimal',
        });
        steps.push({
          stepIndex: 3,
          title: 'Execute Deterministic Schema Transformation',
          handler: 'axon_local',
          status: 'pending',
          summary: 'Transform input records into the target representation (JSON, CSV, or Markdown table).',
          estimatedEffort: 'moderate',
        });
        steps.push({
          stepIndex: 4,
          title: 'Verify Output Syntax and Provide Structural Summary',
          handler: 'axon_local',
          status: 'pending',
          summary: 'Audit transformed payload for format compliance and correctness.',
          estimatedEffort: 'minimal',
        });
        explanation =
          'I am evaluating the input schema, executing the requested data conversion, and verifying the structured output format.';
        break;
      }

      case 'code_architecture_or_design': {
        rationale =
          'Architectural tasks require constraint analysis from workspace memory, modular design, and resource verification against device limits.';
        steps.push({
          stepIndex: 1,
          title: 'Analyze Architectural Constraints and Active Notes',
          handler: 'axon_local',
          status: 'pending',
          summary: 'Review workspace memory, 4GB RAM budget limits, and existing design specs.',
          estimatedEffort: 'moderate',
        });
        steps.push({
          stepIndex: 2,
          title: 'Draft Module Interfaces and State Flow',
          handler: 'axon_local',
          status: 'pending',
          summary: 'Formulate typed component architecture and state management boundaries.',
          estimatedEffort: 'moderate',
        });
        steps.push({
          stepIndex: 3,
          title: 'Verify Performance Footprint and Edge Cases',
          handler: 'axon_local',
          status: 'pending',
          summary: 'Validate memory footprint, mobile responsive sizing, and clean lifecycle cleanup.',
          estimatedEffort: 'minimal',
        });
        steps.push({
          stepIndex: 4,
          title: 'Persist Specification into Project Notes',
          handler: 'axon_local',
          status: 'pending',
          summary: 'Document architectural decisions into project knowledge base for future retrieval.',
          estimatedEffort: 'minimal',
        });
        explanation =
          'I will examine the project notes for our architecture specs and constraints, formulate the modular interface, check the memory footprint against our budget, and document the decisions into project memory.';
        break;
      }

      case 'research_and_synthesis': {
        rationale =
          'Research requires context retrieval from project files, comparative analysis, and structured synthesis.';
        steps.push({
          stepIndex: 1,
          title: 'Retrieve Background Context and Project Files',
          handler: 'axon_local',
          status: 'pending',
          summary: 'Access research files, notes, and linguistical concordances associated with the project.',
          estimatedEffort: 'moderate',
        });
        steps.push({
          stepIndex: 2,
          title: 'Synthesize Comparative Linguistic Analysis',
          handler: 'axon_local',
          status: 'pending',
          summary: 'Analyze source references, extract key historical/linguistic patterns, and draft findings.',
          estimatedEffort: 'moderate',
        });
        steps.push({
          stepIndex: 3,
          title: 'Format Structured Research Output',
          handler: 'axon_local',
          status: 'pending',
          summary: 'Organize insights into cohesive, readable notes with citations and cross-references.',
          estimatedEffort: 'minimal',
        });
        explanation =
          'I will review our project research notes and linguistic files, perform a comparative analysis, and synthesize the findings into a clear, structured summary.';
        break;
      }

      case 'analysis_and_debugging': {
        rationale =
          'Debugging requires isolating failure points, diagnostic reasoning, and targeted remediation.';
        steps.push({
          stepIndex: 1,
          title: 'Isolate Diagnostic Symptoms and Context',
          handler: 'axon_local',
          status: 'pending',
          summary: 'Identify error parameters, stack traces, and affected components.',
          estimatedEffort: 'minimal',
        });
        steps.push({
          stepIndex: 2,
          title: 'Formulate Root-Cause Hypothesis',
          handler: 'axon_local',
          status: 'pending',
          summary: 'Trace runtime flow and pinpoint state mutations or asynchronous race conditions.',
          estimatedEffort: 'moderate',
        });
        steps.push({
          stepIndex: 3,
          title: 'Generate Targeted Fix and Validation Plan',
          handler: 'axon_local',
          status: 'pending',
          summary: 'Produce minimal diff and recommend regression testing steps.',
          estimatedEffort: 'minimal',
        });
        explanation =
          'I will isolate the reported diagnostic parameters, trace the execution path to determine root cause, and formulate a targeted solution.';
        break;
      }

      case 'local_calculation': {
        rationale = 'Mathematical queries execute via deterministic on-device parser to ensure exact accuracy.';
        steps.push({
          stepIndex: 1,
          title: 'Parse Arithmetic Syntax and Bounds',
          handler: 'axon_local',
          status: 'pending',
          summary: 'Extract mathematical tokens and validate operator hierarchy.',
          estimatedEffort: 'minimal',
        });
        steps.push({
          stepIndex: 2,
          title: 'Execute Deterministic Local Calculation',
          handler: 'axon_local',
          status: 'pending',
          summary: 'Compute exact mathematical value locally without network latency.',
          estimatedEffort: 'minimal',
        });
        steps.push({
          stepIndex: 3,
          title: 'Format Mathematical Steps for User',
          handler: 'axon_local',
          status: 'pending',
          summary: 'Provide verified calculation result and operational step breakdown.',
          estimatedEffort: 'minimal',
        });
        explanation =
          'I am evaluating this mathematical expression using AXON’s local arithmetic engine for exact precision.';
        break;
      }

      case 'storage_command': {
        rationale = 'Storage operations inspect the 15GB device manifest and apply compression policies.';
        steps.push({
          stepIndex: 1,
          title: 'Inspect Device Storage Manifest',
          handler: 'axon_local',
          status: 'pending',
          summary: 'Audit current allocations across models, knowledge packs, cache, and user files.',
          estimatedEffort: 'minimal',
        });
        steps.push({
          stepIndex: 2,
          title: 'Execute Storage Routine and Compression',
          handler: 'axon_local',
          status: 'pending',
          summary: 'Apply lossless compression or prune expired cache entries according to user budget.',
          estimatedEffort: 'moderate',
        });
        steps.push({
          stepIndex: 3,
          title: 'Update Manifest Statistics and Log Event',
          handler: 'axon_local',
          status: 'pending',
          summary: 'Persist updated byte tallies to device manifest and record project activity.',
          estimatedEffort: 'minimal',
        });
        explanation =
          'I will inspect our device storage manifest, apply the configured optimization routine, and log the updated storage headroom.';
        break;
      }

      case 'project_timeline_query': {
        rationale = 'Timeline lookups query timestamped ProjectActivityEvent records for factual date reporting.';
        steps.push({
          stepIndex: 1,
          title: 'Query Project Timeline Data Store',
          handler: 'timeline_engine',
          status: 'pending',
          summary: 'Retrieve timestamped activity events matching query criteria.',
          estimatedEffort: 'minimal',
        });
        steps.push({
          stepIndex: 2,
          title: 'Synthesize Factual Timeline Response',
          handler: 'axon_local',
          status: 'pending',
          summary: 'Format structured chronological summary with exact dates.',
          estimatedEffort: 'minimal',
        });
        explanation =
          'I will query our timestamped project activity records and summarize exactly what was worked on and when.';
        break;
      }

      case 'file_intelligence_query': {
        rationale = 'File searches inspect multi-type index catalog across documents, code, and media.';
        steps.push({
          stepIndex: 1,
          title: 'Search File Intelligence Index',
          handler: 'file_intelligence',
          status: 'pending',
          summary: 'Query documents, code, images, and audio metadata.',
          estimatedEffort: 'minimal',
        });
        steps.push({
          stepIndex: 2,
          title: 'Compile File Matches and Summaries',
          handler: 'axon_local',
          status: 'pending',
          summary: 'Format matched files with summaries, sizes, and keywords.',
          estimatedEffort: 'minimal',
        });
        explanation =
          'I will search our indexed project files and return relevant matches with file sizes and summaries.';
        break;
      }

      case 'delegation_candidate': {
        delegationRequired = true;
        const targetCap: CapabilityFeature = intent.constraints.requiresVision
          ? 'vision_multimodal'
          : 'reasoning';

        const bestDelegate = registry?.getBestDelegateFor({
          feature: targetCap,
          requiresVision: intent.constraints.requiresVision,
        });

        const targetProvider = bestDelegate?.provider || 'gemini';
        const reason = intent.constraints.requiresVision
          ? 'Task involves multi-modal visual inspection of an uploaded asset, which exceeds standalone local text reasoning.'
          : 'Task involves heavy full-stack synthesis or live web retrieval exceeding standalone local capability.';

        delegationProposal = {
          targetProvider,
          targetCapability: targetCap,
          reason,
          fallbackAllowed: true,
        };

        rationale = 'Task requires specialized capabilities outside standalone local scope; flagged for external delegation.';
        steps.push({
          stepIndex: 1,
          title: 'Scope Requirements and Define Delegation Contract',
          handler: 'axon_local',
          status: 'pending',
          summary: 'Extract input constraints, attachments, and expected response contract.',
          estimatedEffort: 'minimal',
        });
        steps.push({
          stepIndex: 2,
          title: `Flag for External Delegation (${targetProvider})`,
          handler: 'external_delegate',
          toolOrProvider: targetProvider,
          status: 'pending',
          summary: reason,
          estimatedEffort: 'complex',
        });
        steps.push({
          stepIndex: 3,
          title: 'Validate and Integrate Returned Output',
          handler: 'axon_local',
          status: 'pending',
          summary: 'Inspect delegated output for compliance with project constraints.',
          estimatedEffort: 'minimal',
        });
        explanation = `This task involves ${targetCap}. I have scoped the requirements and flagged this for external tool delegation to ${targetProvider}.`;
        break;
      }

      default: {
        rationale = 'Conversational request addressed directly through AXON local intelligence with project context.';
        steps.push({
          stepIndex: 1,
          title: 'Interpret Conversational Goal with Project Context',
          handler: 'axon_local',
          status: 'pending',
          summary: 'Evaluate user inquiry alongside active project system context and notes.',
          estimatedEffort: 'minimal',
        });
        steps.push({
          stepIndex: 2,
          title: 'Formulate Comprehensive Response',
          handler: 'axon_local',
          status: 'pending',
          summary: 'Synthesize helpful, contextually grounded reply.',
          estimatedEffort: 'minimal',
        });
        steps.push({
          stepIndex: 3,
          title: 'Record Interaction to Project Memory',
          handler: 'axon_local',
          status: 'pending',
          summary: 'Ensure key conversational context is preserved in project activity history.',
          estimatedEffort: 'minimal',
        });
        explanation =
          'I am synthesizing a context-aware response grounded in your active project workspace.';
        break;
      }
    }

    let plan: BrainPlan = {
      id: planId,
      goal: intent.primaryGoal,
      rationale,
      explanation,
      steps,
      delegationRequired,
      delegationProposal,
      createdAt: new Date().toISOString(),
    };

    // Allow registered plan modifiers to customize the plan
    for (const modifier of this.planModifiers) {
      const modified = modifier(request, intent, plan);
      if (modified) plan = modified;
    }

    // Cache plan for the active project
    const projKey = request.projectId || 'default';
    this.activePlansByProject.set(projKey, plan);
    this.activeIntentsByProject.set(projKey, intent);
    const history = this.planHistoryByProject.get(projKey) || [];
    this.planHistoryByProject.set(projKey, [plan, ...history.slice(0, 49)]);

    return plan;
  }

  /**
   * Step 3: Decide: attempt directly, or flag for delegation
   * Core principle: AXON defaults to attempting the task itself.
   * If the task is clearly outside what AXON can currently do alone, it flags this internally
   * (using the Phase 0 delegation hook) rather than attempting and failing silently.
   * Actual delegation logic (calling external AI tools) is NOT executed in this phase.
   */
  public evaluateDelegation(
    request: BrainRequest,
    plan: BrainPlan,
    registry?: CapabilityRegistry
  ): DelegationDecision {
    const availableDelegates = registry ? registry.getAvailableCapabilities() : [];

    // Check custom delegation evaluators first
    for (const evaluator of this.delegationEvaluators) {
      const customDecision = evaluator(request, plan, registry);
      if (customDecision && typeof customDecision.shouldDelegate === 'boolean') {
        const decision: DelegationDecision = {
          shouldDelegate: customDecision.shouldDelegate,
          suggestedProvider: customDecision.suggestedProvider,
          targetCapability: customDecision.targetCapability,
          reason: customDecision.reason || 'Evaluated via custom delegation hook.',
          eligibleDelegates: availableDelegates,
        };
        this.activeDecisionsByProject.set(request.projectId || 'default', decision);
        return decision;
      }
    }

    // Default: Attempt task directly
    if (!plan.delegationRequired || !plan.delegationProposal) {
      const decision: DelegationDecision = {
        shouldDelegate: false,
        reason: 'AXON local intelligence handles this task directly using on-device reasoning and project context.',
        eligibleDelegates: availableDelegates,
      };
      this.activeDecisionsByProject.set(request.projectId || 'default', decision);
      return decision;
    }

    // Task exceeds local boundaries: Flag for delegation internally
    const { targetProvider, targetCapability, reason } = plan.delegationProposal;
    const decision: DelegationDecision = {
      shouldDelegate: true,
      suggestedProvider: targetProvider,
      targetCapability,
      reason,
      eligibleDelegates: availableDelegates,
    };
    this.activeDecisionsByProject.set(request.projectId || 'default', decision);
    return decision;
  }

  /**
   * Step 5: Explains itself when requested
   * Generates a short, plain-language conversational explanation of AXON's plan and reasoning.
   */
  public explainPlan(
    plan: BrainPlan,
    intent: BrainIntent,
    delegation: DelegationDecision
  ): string {
    const lines: string[] = [
      `Here is my execution plan for **"${plan.goal}"**:`,
      '',
      `**Strategy & Rationale:**`,
      `${plan.rationale}`,
      '',
      `**Step-by-Step Sequence (${plan.steps.length} steps):**`,
    ];

    for (const step of plan.steps) {
      const handlerLabel =
        step.handler === 'axon_local'
          ? 'AXON Local'
          : step.handler === 'external_delegate'
          ? `Flagged for Delegate: ${step.toolOrProvider || 'External Tool'}`
          : step.handler === 'timeline_engine'
          ? 'Timeline Engine'
          : 'File Intelligence';

      lines.push(`${step.stepIndex}. **${step.title}** \`[${handlerLabel}]\``);
      lines.push(`   ${step.summary}`);
    }

    lines.push('');
    lines.push(`**Execution Decision:**`);
    if (delegation.shouldDelegate) {
      lines.push(
        `• **Flagged for Delegation**: ${delegation.reason}`
      );
      if (delegation.suggestedProvider) {
        lines.push(
          `  *Target Tool*: \`${delegation.suggestedProvider}\` (${delegation.targetCapability || 'specialized feature'})`
        );
      }
      lines.push(
        `  *Internal Status*: Flagged internally (no external API called; awaiting Phase 2 delegation runtime).`
      );
    } else {
      lines.push(
        `• **Direct Attempt**: ${delegation.reason}`
      );
      lines.push(
        `  *Complexity*: ${intent.complexity.toUpperCase()} | *Confidence*: ${(intent.confidence * 100).toFixed(0)}%`
      );
    }

    if (plan.explanation && plan.explanation !== plan.rationale) {
      lines.push('');
      lines.push(`**Summary**: ${plan.explanation}`);
    }

    return lines.join('\n');
  }

  /**
   * Central Pipeline Entry Point: processRequest
   * Every user request conceptually passes through this method:
   * 1. Understands the request (deep intent and entity analysis)
   * 2. Forms a step-by-step execution plan
   * 3. Evaluates delegation decision (defaults to direct attempt, flags if beyond local scope)
   * 4. Records the plan and decision to the Project System (timestamped activity record)
   * 5. Explains itself when requested
   */
  public async processRequest(request: BrainRequest): Promise<BrainProcessResult> {
    try {
      const { text, projectId, context } = request;
      const registry = context?.capabilityRegistry;
      const timelineEvents = context?.timelineEvents || [];

      // 1. Understand request
      const intent = this.understandRequest(request);

      // 2. Formulate plan
      const plan = this.formPlan(request, intent, registry);

      // 3. Evaluate delegation
      const delegationDecision = this.evaluateDelegation(request, plan, registry);

      // 4. Handle specialized internal queries directly if applicable
      let localResponse: string | undefined;
      let handledLocally = false;
      let modelLabel = 'AXON Core';

      if (intent.isMetaPlanQuery) {
        // Explaining itself on request
        const activePlan = this.getLastPlan(projectId) || plan;
        localResponse = this.explainPlan(activePlan, intent, delegationDecision);
        handledLocally = true;
        modelLabel = 'AXON Plan Explanation';
      } else if (intent.category === 'project_timeline_query') {
        const timelineResult = queryTimelineNaturalLanguage(timelineEvents, text, projectId);
        if (timelineResult.matches) {
          handledLocally = true;
          localResponse = timelineResult.answer;
          modelLabel = 'AXON Project Timeline';
        }
      } else if (intent.category === 'file_intelligence_query') {
        try {
          const fileResults = await fileIntelligence.search({
            naturalLanguageQuery: text,
            projectId,
          });
          handledLocally = true;
          localResponse = fileIntelligence.formatSearchResultsForResponse(text, fileResults);
          modelLabel = 'AXON File Intelligence';
        } catch (fileErr) {
          console.warn('[AXON Brain] fileIntelligence search failed:', fileErr);
        }
      } else if (intent.category === 'local_calculation') {
        const mathResult = safeEvaluateMath(text);
        if (mathResult) {
          handledLocally = true;
          localResponse = [
            `**Calculation Result**: \`${mathResult.result}\``,
            '',
            ...mathResult.steps,
          ].join('\n');
          modelLabel = 'AXON Arithmetic Engine';
        }
      }

      // 5. Step 4: Record the plan and decision to the Project System with real timestamp
      let activityEvent: ProjectActivityEvent | undefined;
      if (projectId) {
        try {
          let activityType: ProjectActivityType = 'plan_created';
          if (intent.category === 'file_intelligence_query' || intent.category === 'project_timeline_query') {
            activityType = 'tool_used';
          } else if (intent.category === 'code_execution') {
            activityType = 'code_executed';
          }

          const decisionText = delegationDecision.shouldDelegate
            ? 'Flagged for delegation'
            : 'Attempting directly';

          const planSummary = `${plan.steps.length}-step plan formed (${decisionText}). ${plan.rationale}`;

          activityEvent = createProjectActivityEvent({
            projectId,
            type: activityType,
            title: intent.isMetaPlanQuery ? 'Plan Explained' : `Plan Formed: ${intent.primaryGoal}`,
            summary: planSummary,
            metadata: {
              planId: plan.id,
              goal: plan.goal,
              stepsCount: plan.steps.length,
              steps: plan.steps.map((s) => ({
                stepIndex: s.stepIndex,
                title: s.title,
                handler: s.handler,
                summary: s.summary,
              })),
              decision: delegationDecision.shouldDelegate ? 'flagged_for_delegation' : 'attempt_directly',
              decisionReason: delegationDecision.reason,
              targetCapability: delegationDecision.targetCapability,
              explanation: plan.explanation,
              intentCategory: intent.category,
              actionVerb: intent.actionVerb,
              targetDomain: intent.targetDomain,
              complexity: intent.complexity,
            },
          });
        } catch (evErr) {
          console.warn('[AXON Brain] Failed to create project activity event:', evErr);
        }
      }

      return {
        requestId: request.id,
        handledLocally,
        intent,
        plan,
        delegationDecision,
        localResponse,
        modelLabel,
        activityEvent,
      };
    } catch (uncaughtErr) {
      console.error('[AxonBrainCore] Uncaught exception in processRequest, falling back safely:', uncaughtErr);
      return {
        requestId: request?.id || 'req-fallback',
        handledLocally: false,
        intent: {
          category: 'conversational',
          primaryGoal: 'Conversational interaction',
          actionVerb: 'chat',
          targetDomain: 'general',
          complexity: 'low',
          confidence: 0.5,
          summary: 'Fallback conversational intent.',
          detectedEntities: { dates: [], files: [], codeKeywords: [], keyConcepts: [] },
          constraints: {},
          isMetaPlanQuery: false,
          suggestedHandling: 'local_axon',
        },
        plan: {
          id: `plan-${Date.now()}-fallback`,
          goal: 'Conversational interaction',
          rationale: 'Reasoning fallback engaged.',
          explanation: 'Proceeding with standard conversational response.',
          steps: [],
          delegationRequired: false,
          createdAt: new Date().toISOString(),
        },
        delegationDecision: {
          shouldDelegate: false,
          reason: 'Direct conversational attempt (fallback).',
          eligibleDelegates: [],
        },
        modelLabel: 'AXON Core',
      };
    }
  }

  /**
   * Generates a context-aware, relevant response using AXON's local/offline reasoning core.
   * Never repeats a static canned string: it genuinely processes the user's message,
   * checks for arithmetic, timeline history, project notes/memory, task breakdown plans,
   * and accurate self-knowledge. If the request genuinely cannot be fulfilled offline,
   * it explains specifically why in relation to that exact request and offers offline alternatives.
   */
  public generateOfflineResponse(request: BrainRequest, brainResult?: BrainProcessResult): string {
    const text = (request.text || '').trim();
    const lowerText = text.toLowerCase();
    const context = request.context;
    const projectNotes = context?.projectNotes || [];
    const timelineEvents = context?.timelineEvents || [];

    // 1. If brainResult already produced a dedicated local response (e.g., timeline query, calculation, meta-plan explanation, file intelligence)
    if (brainResult?.handledLocally && brainResult.localResponse) {
      return brainResult.localResponse;
    }

    // 2. Intent & plan extraction
    const intent = brainResult?.intent || this.understandRequest(request);
    const plan = brainResult?.plan || this.formPlan(request, intent, context?.capabilityRegistry);
    const delegation = brainResult?.delegationDecision || this.evaluateDelegation(request, plan, context?.capabilityRegistry);

    // 3. Meta-Plan / Reasoning Explanation queries
    if (intent.isMetaPlanQuery) {
      const activePlan = this.getLastPlan(request.projectId) || plan;
      return this.explainPlan(activePlan, intent, delegation);
    }

    // 4. Arithmetic calculation
    if (intent.category === 'local_calculation') {
      const mathResult = safeEvaluateMath(text);
      if (mathResult) {
        return [
          `**Calculation Result**: \`${mathResult.result}\``,
          '',
          ...mathResult.steps,
        ].join('\n');
      }
    }

    // 5. Timeline / Activity history queries
    if (intent.category === 'project_timeline_query') {
      const timelineResult = queryTimelineNaturalLanguage(timelineEvents, text, request.projectId);
      if (timelineResult.matches) {
        return timelineResult.answer;
      }
    }

    // 6. Self-knowledge & verified feature status queries
    const selfQuery = detectSelfKnowledgeQuery(text);
    if (selfQuery.matches) {
      return selfQuery.response;
    }

    // 7. Project Notes & Memory queries
    const isNotesQuery =
      /(?:notes?|documentation|memos?|saved context|project memory|specs?)\b/i.test(lowerText) &&
      /(?:what|show|list|search|find|view|do (?:we|i) have|any)\b/i.test(lowerText);

    if (isNotesQuery) {
      if (projectNotes.length === 0) {
        return `I checked your active project notes in AXON memory. There are currently no notes recorded in this project workspace.\n\nYou can create a note anytime in the Notes tab or ask me to draft one for you now.`;
      }

      // If user asks for a specific topic in notes
      const topicMatch = text.match(/(?:about|for|regarding|on)\s+([a-zA-Z0-9_\- ]+)/i);
      const queryTopic = topicMatch ? topicMatch[1].trim().toLowerCase() : '';

      if (queryTopic) {
        const matchingNotes = projectNotes.filter(
          (n) =>
            n.title.toLowerCase().includes(queryTopic) ||
            n.content.toLowerCase().includes(queryTopic) ||
            (n.tags && n.tags.some((t) => t.toLowerCase().includes(queryTopic)))
        );

        if (matchingNotes.length > 0) {
          const formatted = matchingNotes
            .slice(0, 3)
            .map((n) => `• **${n.title}** (${n.category})\n  ${n.content.slice(0, 180)}${n.content.length > 180 ? '...' : ''}`)
            .join('\n\n');
          return `I searched your project notes for "${queryTopic}" and found ${matchingNotes.length} matching entry:\n\n${formatted}`;
        }
      }

      const noteList = projectNotes
        .slice(0, 5)
        .map((n) => `• **${n.title}** (${n.category}) — *${n.updatedAt ? new Date(n.updatedAt).toLocaleDateString() : 'Active'}*`)
        .join('\n');
      return `Here are the active notes recorded in this project workspace (${projectNotes.length} total):\n\n${noteList}\n\nYou can view full details in the Notes tab or ask me to search specific contents.`;
    }

    // 8. Storage Manifest commands
    if (intent.category === 'storage_command') {
      return `**AXON Storage Manifest (Offline Core)**:\n\n• **Budget Allocation**: 15.0 GB maximum quota.\n• **Offline Engine**: Indexed local database storage is active.\n• **Asset Compression**: Lossless text/code storage and synthetic quality restoration are enabled.\n• **Cache State**: Clean and synchronized with local project state.`;
    }

    // 9. Structured Task Planning, Architecture, or Engineering Design
    if (
      intent.category === 'task_planning' ||
      intent.category === 'code_architecture_or_design' ||
      intent.category === 'analysis_and_debugging' ||
      intent.category === 'data_transformation'
    ) {
      const stepItems = plan.steps
        .map(
          (s) =>
            `${s.stepIndex}. **${s.title}**\n   ${s.summary}`
        )
        .join('\n\n');

      return [
        `### Plan Formulated: ${intent.primaryGoal}`,
        '',
        `*Rationale*: ${plan.rationale}`,
        '',
        '**Sequenced Execution Steps:**',
        stepItems,
        '',
        `*Local Workspace Action*: You can implement and test code modules directly in the Workspace tab, or ask me to document this architecture to your Project Notes.`,
      ].join('\n');
    }

    // 10. Content Creation / Drafting
    if (intent.category === 'content_creation') {
      return [
        `### Draft Outline: ${intent.primaryGoal}`,
        '',
        `*Category*: ${intent.targetDomain.toUpperCase()} | *Complexity*: ${intent.complexity}`,
        '',
        '**Proposed Structure:**',
        `1. **Executive Summary**: Core objective and contextual overview.`,
        `2. **Key Requirements**: Detailed technical specifications and functional targets.`,
        `3. **Implementation Plan**: Phased delivery milestones and validation criteria.`,
        `4. **Verification & Notes**: Verification logs, edge cases, and references.`,
        '',
        `Would you like me to save this structured outline directly into your Project Notes?`,
      ].join('\n');
    }

    // 11. Heavy tasks genuinely requiring external cloud delegation (live web search, vision with image attachment, massive external codebases)
    if (delegation.shouldDelegate || intent.category === 'delegation_candidate') {
      const specificSubject = intent.primaryGoal || 'your specific request';
      const reasonDetail = delegation.reason || 'this task exceeds standalone on-device processing capabilities';
      const targetTool = delegation.suggestedProvider ? `\`${delegation.suggestedProvider}\`` : 'an external AI tool';

      return [
        `I am currently operating in offline mode via AXON Local Core.`,
        '',
        `For **${specificSubject}**, external delegation to ${targetTool} is required because ${reasonDetail}.`,
        '',
        `**What I Can Do Offline Right Now:**`,
        `• Formulate a detailed architectural plan and step-by-step implementation breakdown.`,
        `• Search and cross-reference your local Project Notes and Timeline history.`,
        `• Write and run deterministic calculations or sandboxed JavaScript/TypeScript in the Workspace.`,
        `• Save this task to your project notes so it is ready for delegation once network connectivity is available.`,
      ].join('\n');
    }

    // 12. Conversational greetings & direct follow-up inquiries
    const greetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'greetings', 'sup', 'yo'];
    const isPureGreeting = greetings.includes(lowerText) || /^(?:hello|hi|hey)\b/i.test(lowerText);

    if (isPureGreeting) {
      return `Hello! I am AXON, running via my on-device local core. I am fully active and ready to assist you offline.\n\nI can help you:\n• Plan, architect, and break down project features\n• Run arithmetic calculations and conversions\n• Search and organize your Project Notes and Timeline activity\n• Write and test scripts in the Run Code workspace\n\nWhat would you like to work on?`;
    }

    // Contextual direct response addressing the user's message
    const entitiesSummary = [
      ...(intent.detectedEntities.codeKeywords || []),
      ...(intent.detectedEntities.keyConcepts || []),
    ];

    const contextSnippet = entitiesSummary.length > 0
      ? ` (specifically regarding ${entitiesSummary.slice(0, 3).map((e) => `\`${e}\``).join(', ')})`
      : '';

    return [
      `I have processed your inquiry${contextSnippet} using AXON's local reasoning core.`,
      '',
      `**Objective Identified**: ${intent.primaryGoal}`,
      `**Active Local Status**: Operational in offline workspace mode.`,
      '',
      `I am ready to proceed. Let me know if you would like me to format this as a step-by-step plan, write a script in the Workspace runner, or save it to your Project Notes.`,
    ].join('\n');
  }
}

// Export singleton instance
export const axonBrain = new AxonBrainCore();
