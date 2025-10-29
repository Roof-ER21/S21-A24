/**
 * Voice Command Parser for S21-A24
 *
 * Recognizes and executes voice commands for field use:
 * - "Hey Susan/Agnes" - Activate persona
 * - "Draft email about [topic]" - Email drafting
 * - "Analyze this photo" - Photo mode
 * - "What is [query]" - Knowledge search
 * - "Quiz me on [topic]" - Start quiz
 * - "Pause/Stop" - Stop listening
 * - "Resume" - Resume listening
 */

import type { PersonaVoice } from './text-to-speech';

export type CommandType =
  | 'activate-persona'
  | 'draft-email'
  | 'analyze-photo'
  | 'knowledge-search'
  | 'start-quiz'
  | 'pause'
  | 'resume'
  | 'stop'
  | 'help'
  | 'unknown';

export interface VoiceCommand {
  type: CommandType;
  intent: string;
  parameters?: Record<string, any>;
  confidence: number;
  originalText: string;
  timestamp: Date;
}

export interface CommandPattern {
  type: CommandType;
  patterns: RegExp[];
  extractParams?: (match: RegExpMatchArray) => Record<string, any>;
  description: string;
  examples: string[];
}

const COMMAND_PATTERNS: CommandPattern[] = [
  {
    type: 'activate-persona',
    patterns: [
      /\b(hey\s+)?(susan|agnes)\b/i,
      /\btalk\s+to\s+(susan|agnes)\b/i,
      /\bswitch\s+to\s+(susan|agnes)\b/i,
    ],
    extractParams: (match) => ({
      persona: match[2]?.toLowerCase() || match[1]?.toLowerCase(),
    }),
    description: 'Activate a specific AI persona',
    examples: ['Hey Susan', 'Talk to Agnes', 'Switch to Susan'],
  },
  {
    type: 'draft-email',
    patterns: [
      /\bdraft\s+(an?\s+)?email\s+(about|regarding|for)\s+(.+)/i,
      /\bwrite\s+(an?\s+)?email\s+(about|regarding|for)\s+(.+)/i,
      /\bcompose\s+(an?\s+)?email\s+(about|regarding|for)\s+(.+)/i,
      /\bemail\s+(about|regarding)\s+(.+)/i,
    ],
    extractParams: (match) => ({
      topic: match[3] || match[2],
    }),
    description: 'Draft an email about a specific topic',
    examples: [
      'Draft email about roof warranty',
      'Write an email for customer follow-up',
      'Compose email about GAF installation',
    ],
  },
  {
    type: 'analyze-photo',
    patterns: [
      /\banalyze\s+(this\s+)?(photo|image|picture)/i,
      /\bwhat('?s|\s+is)\s+(in\s+)?(this\s+)?(photo|image|picture)/i,
      /\blook\s+at\s+(this\s+)?(photo|image|picture)/i,
      /\bcheck\s+(this\s+)?(photo|image|picture)/i,
    ],
    extractParams: () => ({}),
    description: 'Analyze a photo or image',
    examples: [
      'Analyze this photo',
      "What's in this picture",
      'Look at this image',
    ],
  },
  {
    type: 'knowledge-search',
    patterns: [
      /\bwhat\s+(is|are)\s+(.+)/i,
      /\btell\s+me\s+about\s+(.+)/i,
      /\bexplain\s+(.+)/i,
      /\bfind\s+(info|information)\s+(on|about)\s+(.+)/i,
      /\blook\s+up\s+(.+)/i,
      /\bsearch\s+(for\s+)?(.+)/i,
    ],
    extractParams: (match) => ({
      query: match[2] || match[1],
    }),
    description: 'Search knowledge base for information',
    examples: [
      'What is GAF Timberline HDZ',
      'Tell me about roof warranties',
      'Explain ice and water shield',
    ],
  },
  {
    type: 'start-quiz',
    patterns: [
      /\bquiz\s+me\s+(on|about)\s+(.+)/i,
      /\btest\s+me\s+(on|about)\s+(.+)/i,
      /\bstart\s+(a\s+)?quiz\s+(on|about)\s+(.+)/i,
    ],
    extractParams: (match) => ({
      topic: match[2] || match[3],
    }),
    description: 'Start a quiz on a specific topic',
    examples: [
      'Quiz me on GAF products',
      'Test me about installation',
      'Start a quiz on sales techniques',
    ],
  },
  {
    type: 'pause',
    patterns: [
      /\b(pause|hold|wait|stop\s+listening)\b/i,
      /\bbe\s+quiet\b/i,
      /\bstop\s+talking\b/i,
    ],
    extractParams: () => ({}),
    description: 'Pause voice listening',
    examples: ['Pause', 'Stop listening', 'Wait'],
  },
  {
    type: 'resume',
    patterns: [
      /\b(resume|continue|start\s+listening)\b/i,
      /\bwake\s+up\b/i,
      /\bstart\s+again\b/i,
    ],
    extractParams: () => ({}),
    description: 'Resume voice listening',
    examples: ['Resume', 'Continue', 'Start listening'],
  },
  {
    type: 'stop',
    patterns: [
      /\b(stop|quit|exit|close)\b/i,
      /\bend\s+(session|conversation)\b/i,
      /\bturn\s+off\b/i,
    ],
    extractParams: () => ({}),
    description: 'Stop voice mode completely',
    examples: ['Stop', 'Exit', 'End session'],
  },
  {
    type: 'help',
    patterns: [
      /\b(help|commands|what\s+can\s+you\s+do)\b/i,
      /\bshow\s+commands\b/i,
      /\blist\s+commands\b/i,
    ],
    extractParams: () => ({}),
    description: 'Show available commands',
    examples: ['Help', 'What can you do', 'Show commands'],
  },
];

type CommandCallback = (command: VoiceCommand) => void;

class CommandParser {
  private callbacks: CommandCallback[] = [];
  private commandHistory: VoiceCommand[] = [];
  private maxHistorySize: number = 50;

  /**
   * Parse text into voice command
   */
  parse(text: string, confidence: number = 1.0): VoiceCommand {
    const normalizedText = text.toLowerCase().trim();

    // Try to match against all patterns
    for (const pattern of COMMAND_PATTERNS) {
      for (const regex of pattern.patterns) {
        const match = normalizedText.match(regex);
        if (match) {
          const parameters = pattern.extractParams
            ? pattern.extractParams(match)
            : {};

          const command: VoiceCommand = {
            type: pattern.type,
            intent: pattern.description,
            parameters,
            confidence,
            originalText: text,
            timestamp: new Date(),
          };

          console.log('[Command] Parsed:', command);
          this.addToHistory(command);
          this.notifyCallbacks(command);

          return command;
        }
      }
    }

    // No match found - return unknown command
    const unknownCommand: VoiceCommand = {
      type: 'unknown',
      intent: 'Unrecognized command',
      parameters: { text },
      confidence,
      originalText: text,
      timestamp: new Date(),
    };

    console.log('[Command] Unknown:', unknownCommand);
    this.addToHistory(unknownCommand);
    this.notifyCallbacks(unknownCommand);

    return unknownCommand;
  }

  /**
   * Execute parsed command
   */
  execute(command: VoiceCommand): void {
    console.log('[Command] Executing:', command.type);

    switch (command.type) {
      case 'activate-persona':
        this.executeActivatePersona(command);
        break;
      case 'draft-email':
        this.executeDraftEmail(command);
        break;
      case 'analyze-photo':
        this.executeAnalyzePhoto(command);
        break;
      case 'knowledge-search':
        this.executeKnowledgeSearch(command);
        break;
      case 'start-quiz':
        this.executeStartQuiz(command);
        break;
      case 'pause':
        this.executePause(command);
        break;
      case 'resume':
        this.executeResume(command);
        break;
      case 'stop':
        this.executeStop(command);
        break;
      case 'help':
        this.executeHelp(command);
        break;
      default:
        this.executeUnknown(command);
    }
  }

  /**
   * Command execution handlers
   */
  private executeActivatePersona(command: VoiceCommand): void {
    const persona = command.parameters?.persona as PersonaVoice;
    console.log(`[Command] Activating persona: ${persona}`);
    // Will be implemented in integration
  }

  private executeDraftEmail(command: VoiceCommand): void {
    const topic = command.parameters?.topic;
    console.log(`[Command] Drafting email about: ${topic}`);
    // Will be implemented in integration
  }

  private executeAnalyzePhoto(command: VoiceCommand): void {
    console.log('[Command] Analyzing photo');
    // Will be implemented in integration
  }

  private executeKnowledgeSearch(command: VoiceCommand): void {
    const query = command.parameters?.query;
    console.log(`[Command] Searching knowledge base: ${query}`);
    // Will be implemented in integration
  }

  private executeStartQuiz(command: VoiceCommand): void {
    const topic = command.parameters?.topic;
    console.log(`[Command] Starting quiz on: ${topic}`);
    // Will be implemented in integration
  }

  private executePause(command: VoiceCommand): void {
    console.log('[Command] Pausing voice mode');
    // Will be implemented in integration
  }

  private executeResume(command: VoiceCommand): void {
    console.log('[Command] Resuming voice mode');
    // Will be implemented in integration
  }

  private executeStop(command: VoiceCommand): void {
    console.log('[Command] Stopping voice mode');
    // Will be implemented in integration
  }

  private executeHelp(command: VoiceCommand): void {
    console.log('[Command] Showing help');
    // Will be implemented in integration
  }

  private executeUnknown(command: VoiceCommand): void {
    console.log('[Command] Unknown command, treating as general query');
    // Will be implemented in integration
  }

  /**
   * Add command to history
   */
  private addToHistory(command: VoiceCommand): void {
    this.commandHistory.unshift(command);

    // Trim history to max size
    if (this.commandHistory.length > this.maxHistorySize) {
      this.commandHistory = this.commandHistory.slice(0, this.maxHistorySize);
    }
  }

  /**
   * Notify all callbacks
   */
  private notifyCallbacks(command: VoiceCommand): void {
    this.callbacks.forEach((callback) => {
      try {
        callback(command);
      } catch (error) {
        console.error('[Command] Callback error:', error);
      }
    });
  }

  /**
   * Register callback for commands
   */
  onCommand(callback: CommandCallback): () => void {
    this.callbacks.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index > -1) {
        this.callbacks.splice(index, 1);
      }
    };
  }

  /**
   * Get command history
   */
  getHistory(limit?: number): VoiceCommand[] {
    return limit
      ? this.commandHistory.slice(0, limit)
      : [...this.commandHistory];
  }

  /**
   * Clear command history
   */
  clearHistory(): void {
    this.commandHistory = [];
    console.log('[Command] History cleared');
  }

  /**
   * Get available commands
   */
  getAvailableCommands(): CommandPattern[] {
    return COMMAND_PATTERNS;
  }

  /**
   * Get help text
   */
  getHelpText(): string {
    const sections = COMMAND_PATTERNS.map((pattern) => {
      const examples = pattern.examples.join('\n  - ');
      return `${pattern.description}:\n  - ${examples}`;
    });

    return `Available Voice Commands:\n\n${sections.join('\n\n')}`;
  }

  /**
   * Detect if text contains a command
   */
  containsCommand(text: string): boolean {
    const normalizedText = text.toLowerCase().trim();

    return COMMAND_PATTERNS.some((pattern) =>
      pattern.patterns.some((regex) => regex.test(normalizedText))
    );
  }

  /**
   * Get command type from text without full parsing
   */
  getCommandType(text: string): CommandType {
    const normalizedText = text.toLowerCase().trim();

    for (const pattern of COMMAND_PATTERNS) {
      for (const regex of pattern.patterns) {
        if (regex.test(normalizedText)) {
          return pattern.type;
        }
      }
    }

    return 'unknown';
  }
}

// Singleton instance
export const commandParser = new CommandParser();

// Export for React hooks
export function useCommandParser() {
  return commandParser;
}
