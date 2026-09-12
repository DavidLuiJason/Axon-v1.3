export function detectSelfKnowledgeQuery(text: string): { matches: boolean; response: string } {
  const norm = text.trim().toLowerCase();

  // Feature status queries (e.g. "are all features fully functional", "what features are built")
  const featureStatusQueries = [
    'are all features fully functional',
    'are features fully functional',
    'is everything working',
    'what features are built',
    'what features are functional',
    'what features work',
    'status of features',
    'are all features working',
    'feature status',
    'what can you do offline',
    'offline capabilities',
  ];

  const matchesFeatureStatus = featureStatusQueries.some((q) => norm.includes(q)) ||
    (norm.includes('feature') && norm.includes('functional')) ||
    (norm.includes('features') && norm.includes('working'));

  if (matchesFeatureStatus) {
    const response = `I am running via AXON Local Core. Here is the verified status of all system features:

**Fully Functional On-Device:**
• **Dual-Pane Workspace**: Chat left, workspace/code right with 3 view modes (chat-only, 50/50 split, workspace-only).
• **AXON Brain & Planning**: Intent classification, step-by-step reasoning plans, and project activity event tracking.
• **Project Notes & Memory**: Scoped per-project memory, full-text search, tags, pin/unpin, and data extraction.
• **Project Timeline**: Natural language search over timestamped project history and activity logs.
• **Offline Tools & Math**: Deterministic arithmetic calculations, color utilities, text tools, and conversion utilities.
• **Automation & Run Code Layer**: Trigger-and-action rules engine and sandboxed live Run Code hooks.
• **Storage Manifest Engine**: 15GB device budgeting with category breakdowns and asset compression modes.

**External Delegation Tools:**
• **Multi-AI Connections**: External tool accounts (Gemini, Claude, ChatGPT) for specialized sub-task delegation (active when online with configured credentials).

**Not Yet Built (Future Roadmap):**
• Voice synthesis and a full video sequencer are planned for future phases and are not yet built.`;
    return { matches: true, response };
  }

  const selfQueries = [
    'who are you',
    'what are you',
    'what is axon',
    'what can you do',
    'describe yourself',
    'tell me about yourself',
    'help me',
    'axon capabilities',
  ];

  const matches = selfQueries.some((q) => norm.includes(q)) || (norm.includes('who') && norm.includes('axon'));

  if (!matches) {
    return { matches: false, response: '' };
  }

  const response = `I am AXON — a unified AI workspace engineered for mobile-first productivity and software development.\n\nHere are my core capabilities:\n• **Dual-Pane Interface**: Fluid split-view combining conversational AI with an interactive live workspace.\n• **Offline Reasoning & Planning**: On-device intent analysis, deterministic calculations, project timeline tracking, and task formulation.\n• **Project Memory & Notes**: Scoped workspace context, tag categorization, and document extraction.\n• **Storage Manifest Engine**: 15GB device storage budgeting with lossy/lossless asset optimizations.\n• **Live Automation Rules**: Event-driven automation rules and sandboxed Run Code hooks.\n• **External Tool Delegation**: Capability to delegate specialized sub-tasks to external models (Gemini, Claude, ChatGPT) without altering AXON's core identity.`;

  return { matches: true, response };
}

export function detectAccountSwitchCommand(text: string): {
  isSwitchCommand: boolean;
  targetAccountLabel?: string;
} {
  const norm = text.trim().toLowerCase();
  const match = norm.match(/(?:switch\s+to|log\s+in\s+to|use\s+account)\s+(.+)/i);
  if (match) {
    return {
      isSwitchCommand: true,
      targetAccountLabel: match[1].trim(),
    };
  }
  return { isSwitchCommand: false };
}

export function buildAxonSystemInstruction(projectContext?: string): string {
  return `You are AXON, an AI-powered smartphone workspace and engineering assistant.
You provide concise, high-contrast, mathematically precise answers suitable for mobile viewports.
When code is requested, output clean, executable snippets.
${projectContext ? `Project Context: ${projectContext}` : ''}`;
}
