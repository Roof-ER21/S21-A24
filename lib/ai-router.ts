/**
 * S21-A24 AI Router
 * Smart routing system for cost-optimized multi-provider AI
 *
 * Provider Strategy:
 * - Gemini: Voice/image (FREE tier)
 * - Groq: Hands-free/urgent (25x faster)
 * - HuggingFace: Knowledge search (73% cheaper)
 * - Together AI: Balanced default
 */

export type AIProvider = 'gemini' | 'groq' | 'together' | 'huggingface';

export type RequestType =
  | 'text'
  | 'voice'
  | 'image'
  | 'knowledge-search'
  | 'code-generation'
  | 'analysis';

export type UrgencyLevel = 'low' | 'medium' | 'high' | 'urgent';
export type ModeType = 'normal' | 'hands-free' | 'batch';

export interface RequestContext {
  type: RequestType;
  urgency?: UrgencyLevel;
  mode?: ModeType;
  estimatedTokens?: number;
  requiresStreaming?: boolean;
  userPreference?: AIProvider;
}

export interface ProviderStatus {
  available: boolean;
  latency: number;
  errorRate: number;
  lastChecked: Date;
}

export interface ProviderLimits {
  gemini: {
    freeRequestsPerDay: number;
    freeRequestsPerMinute: number;
    currentUsage: number;
  };
  groq: {
    requestsPerMinute: number;
    tokensPerMinute: number;
  };
  together: {
    requestsPerMinute: number;
  };
  huggingface: {
    requestsPerMinute: number;
  };
}

class AIRouter {
  private providerStatus: Record<AIProvider, ProviderStatus> = {
    gemini: { available: true, latency: 0, errorRate: 0, lastChecked: new Date() },
    groq: { available: true, latency: 0, errorRate: 0, lastChecked: new Date() },
    together: { available: true, latency: 0, errorRate: 0, lastChecked: new Date() },
    huggingface: { available: true, latency: 0, errorRate: 0, lastChecked: new Date() },
  };

  private providerLimits: ProviderLimits = {
    gemini: {
      freeRequestsPerDay: 1500, // Gemini Free tier: 1,500 RPD
      freeRequestsPerMinute: 15,
      currentUsage: 0,
    },
    groq: {
      requestsPerMinute: 30,
      tokensPerMinute: 14400, // Groq free tier
    },
    together: {
      requestsPerMinute: 60,
    },
    huggingface: {
      requestsPerMinute: 10,
    },
  };

  /**
   * Main routing logic - selects optimal AI provider
   */
  routeRequest(context: RequestContext): AIProvider {
    // Priority 1: User preference (if valid)
    if (context.userPreference && this.isProviderAvailable(context.userPreference)) {
      return context.userPreference;
    }

    // Priority 2: Voice/Image → Gemini FREE tier
    if (context.type === 'voice' || context.type === 'image') {
      if (this.withinGeminiFreeLimit()) {
        return 'gemini';
      }
    }

    // Priority 3: Urgent/Hands-free → Groq (25x faster than GPT-4)
    if (
      context.mode === 'hands-free' ||
      context.urgency === 'urgent' ||
      context.urgency === 'high'
    ) {
      if (this.isProviderAvailable('groq')) {
        return 'groq';
      }
    }

    // Priority 4: Knowledge search → HuggingFace (73% cheaper)
    if (context.type === 'knowledge-search') {
      if (this.isProviderAvailable('huggingface')) {
        return 'huggingface';
      }
    }

    // Priority 5: Code generation → Groq (specialized models)
    if (context.type === 'code-generation') {
      if (this.isProviderAvailable('groq')) {
        return 'groq';
      }
    }

    // Default: Together AI (balanced performance/cost)
    if (this.isProviderAvailable('together')) {
      return 'together';
    }

    // Fallback chain
    const fallbackOrder: AIProvider[] = ['groq', 'gemini', 'together', 'huggingface'];
    for (const provider of fallbackOrder) {
      if (this.isProviderAvailable(provider)) {
        return provider;
      }
    }

    // Last resort
    return 'together';
  }

  /**
   * Check if Gemini is within free tier limits
   */
  private withinGeminiFreeLimit(): boolean {
    const { currentUsage, freeRequestsPerDay } = this.providerLimits.gemini;
    return currentUsage < freeRequestsPerDay * 0.9; // 90% threshold
  }

  /**
   * Check if provider is available and healthy
   */
  isProviderAvailable(provider: AIProvider): boolean {
    const status = this.providerStatus[provider];

    // Check basic availability
    if (!status.available) return false;

    // Check error rate (if > 50%, consider unavailable)
    if (status.errorRate > 0.5) return false;

    // Check if status is stale (> 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    if (status.lastChecked < fiveMinutesAgo) {
      // Status is stale, but assume available
      return true;
    }

    return true;
  }

  /**
   * Update provider status based on health check
   */
  updateProviderStatus(provider: AIProvider, status: Partial<ProviderStatus>) {
    this.providerStatus[provider] = {
      ...this.providerStatus[provider],
      ...status,
      lastChecked: new Date(),
    };
  }

  /**
   * Increment Gemini usage counter
   */
  incrementGeminiUsage() {
    this.providerLimits.gemini.currentUsage++;
  }

  /**
   * Reset daily usage counters (call at midnight)
   */
  resetDailyUsage() {
    this.providerLimits.gemini.currentUsage = 0;
  }

  /**
   * Get provider status for monitoring
   */
  getProviderStatus(provider: AIProvider): ProviderStatus {
    return this.providerStatus[provider];
  }

  /**
   * Get all provider statuses
   */
  getAllProviderStatuses(): Record<AIProvider, ProviderStatus> {
    return this.providerStatus;
  }

  /**
   * Get estimated cost per request (in cents)
   */
  getEstimatedCost(provider: AIProvider, tokens: number): number {
    const costPer1KTokens = {
      gemini: 0, // FREE tier
      groq: 0.27, // $0.27/1M tokens = $0.00027/1K
      together: 0.8, // ~$0.80/1M tokens
      huggingface: 0.2, // ~$0.20/1M tokens (73% cheaper)
    };

    return (tokens / 1000) * costPer1KTokens[provider];
  }

  /**
   * Get recommended provider with cost estimate
   */
  getRecommendationWithCost(context: RequestContext): {
    provider: AIProvider;
    estimatedCost: number;
    reason: string;
  } {
    const provider = this.routeRequest(context);
    const tokens = context.estimatedTokens || 1000;
    const estimatedCost = this.getEstimatedCost(provider, tokens);

    let reason = '';
    switch (provider) {
      case 'gemini':
        reason = 'Using Gemini (FREE tier) for voice/image';
        break;
      case 'groq':
        reason = 'Using Groq for fast response (25x faster)';
        break;
      case 'huggingface':
        reason = 'Using HuggingFace for cost optimization (73% cheaper)';
        break;
      case 'together':
        reason = 'Using Together AI for balanced performance';
        break;
    }

    return { provider, estimatedCost, reason };
  }
}

// Singleton instance
export const aiRouter = new AIRouter();

// Convenience function
export function routeAIRequest(context: RequestContext): AIProvider {
  return aiRouter.routeRequest(context);
}
