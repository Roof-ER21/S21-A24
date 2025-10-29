/**
 * S21-A24 Cost Tracker
 * Real-time cost tracking and budget management for multi-provider AI
 *
 * Features:
 * - Token counting per provider
 * - Real-time cost calculation
 * - Budget alerts
 * - Monthly/daily reports
 * - Historical data tracking
 */

import { AIProvider } from './ai-router';

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  timestamp: Date;
}

export interface CostEntry {
  provider: AIProvider;
  usage: TokenUsage;
  cost: number;
  requestType: string;
  timestamp: Date;
}

export interface ProviderCosts {
  gemini: {
    inputCostPer1M: number;
    outputCostPer1M: number;
    freeTier: boolean;
  };
  groq: {
    inputCostPer1M: number;
    outputCostPer1M: number;
    freeTier: boolean;
  };
  together: {
    inputCostPer1M: number;
    outputCostPer1M: number;
    freeTier: boolean;
  };
  huggingface: {
    inputCostPer1M: number;
    outputCostPer1M: number;
    freeTier: boolean;
  };
}

export interface BudgetConfig {
  dailyLimit: number;
  monthlyLimit: number;
  warningThreshold: number; // Percentage (e.g., 80 = 80%)
  criticalThreshold: number; // Percentage (e.g., 95 = 95%)
}

export interface CostSummary {
  today: number;
  yesterday: number;
  thisMonth: number;
  lastMonth: number;
  total: number;
  byProvider: Record<AIProvider, number>;
}

class CostTracker {
  private costs: CostEntry[] = [];
  private storageKey = 's21-a24-cost-tracker';

  // Current pricing (as of 2025) - all in USD per 1M tokens
  private providerCosts: ProviderCosts = {
    gemini: {
      inputCostPer1M: 0, // FREE tier (1,500 RPD)
      outputCostPer1M: 0,
      freeTier: true,
    },
    groq: {
      inputCostPer1M: 0.05, // $0.05/1M input tokens
      outputCostPer1M: 0.08, // $0.08/1M output tokens
      freeTier: true, // Generous free tier
    },
    together: {
      inputCostPer1M: 0.18, // ~$0.18/1M tokens
      outputCostPer1M: 0.18,
      freeTier: false,
    },
    huggingface: {
      inputCostPer1M: 0.05, // ~$0.05/1M tokens (73% cheaper)
      outputCostPer1M: 0.05,
      freeTier: true, // Rate limited
    },
  };

  private budget: BudgetConfig = {
    dailyLimit: 1.0, // $1/day
    monthlyLimit: 25.0, // $25/month
    warningThreshold: 80, // 80%
    criticalThreshold: 95, // 95%
  };

  constructor() {
    this.loadFromStorage();
    this.setupPeriodicCleanup();
  }

  /**
   * Track a new API request
   */
  trackRequest(
    provider: AIProvider,
    usage: TokenUsage,
    requestType: string = 'chat'
  ): CostEntry {
    const cost = this.calculateCost(provider, usage);

    const entry: CostEntry = {
      provider,
      usage,
      cost,
      requestType,
      timestamp: new Date(),
    };

    this.costs.push(entry);
    this.saveToStorage();

    // Check for budget alerts
    this.checkBudgetAlerts();

    return entry;
  }

  /**
   * Calculate cost for a specific usage
   */
  calculateCost(provider: AIProvider, usage: TokenUsage): number {
    const pricing = this.providerCosts[provider];

    // Free tier providers
    if (pricing.freeTier && (provider === 'gemini' || provider === 'groq' || provider === 'huggingface')) {
      return 0;
    }

    const inputCost = (usage.promptTokens / 1_000_000) * pricing.inputCostPer1M;
    const outputCost = (usage.completionTokens / 1_000_000) * pricing.outputCostPer1M;

    return inputCost + outputCost;
  }

  /**
   * Get cost summary for different time periods
   */
  getSummary(): CostSummary {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(monthStart);
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);

    const summary: CostSummary = {
      today: 0,
      yesterday: 0,
      thisMonth: 0,
      lastMonth: 0,
      total: 0,
      byProvider: {
        gemini: 0,
        groq: 0,
        together: 0,
        huggingface: 0,
      },
    };

    for (const entry of this.costs) {
      const entryDate = new Date(entry.timestamp);

      summary.total += entry.cost;
      summary.byProvider[entry.provider] += entry.cost;

      if (entryDate >= todayStart) {
        summary.today += entry.cost;
      } else if (entryDate >= yesterdayStart && entryDate < todayStart) {
        summary.yesterday += entry.cost;
      }

      if (entryDate >= monthStart) {
        summary.thisMonth += entry.cost;
      } else if (entryDate >= lastMonthStart && entryDate < monthStart) {
        summary.lastMonth += entry.cost;
      }
    }

    return summary;
  }

  /**
   * Get detailed breakdown by provider
   */
  getProviderBreakdown(provider: AIProvider): {
    totalCost: number;
    totalTokens: number;
    requestCount: number;
    averageCostPerRequest: number;
    averageTokensPerRequest: number;
  } {
    const providerEntries = this.costs.filter((e) => e.provider === provider);

    const totalCost = providerEntries.reduce((sum, e) => sum + e.cost, 0);
    const totalTokens = providerEntries.reduce((sum, e) => sum + e.usage.totalTokens, 0);
    const requestCount = providerEntries.length;

    return {
      totalCost,
      totalTokens,
      requestCount,
      averageCostPerRequest: requestCount > 0 ? totalCost / requestCount : 0,
      averageTokensPerRequest: requestCount > 0 ? totalTokens / requestCount : 0,
    };
  }

  /**
   * Check if budget limits are being approached
   */
  checkBudgetAlerts(): {
    level: 'safe' | 'warning' | 'critical' | 'exceeded';
    message: string;
    percentage: number;
  } | null {
    const summary = this.getSummary();
    const dailyPercentage = (summary.today / this.budget.dailyLimit) * 100;
    const monthlyPercentage = (summary.thisMonth / this.budget.monthlyLimit) * 100;

    const maxPercentage = Math.max(dailyPercentage, monthlyPercentage);

    if (maxPercentage >= 100) {
      return {
        level: 'exceeded',
        message: `Budget exceeded! Daily: $${summary.today.toFixed(4)}/$${this.budget.dailyLimit}, Monthly: $${summary.thisMonth.toFixed(2)}/$${this.budget.monthlyLimit}`,
        percentage: maxPercentage,
      };
    } else if (maxPercentage >= this.budget.criticalThreshold) {
      return {
        level: 'critical',
        message: `Critical: ${maxPercentage.toFixed(1)}% of budget used`,
        percentage: maxPercentage,
      };
    } else if (maxPercentage >= this.budget.warningThreshold) {
      return {
        level: 'warning',
        message: `Warning: ${maxPercentage.toFixed(1)}% of budget used`,
        percentage: maxPercentage,
      };
    } else if (maxPercentage > 0) {
      return {
        level: 'safe',
        message: `Budget healthy: ${maxPercentage.toFixed(1)}% used`,
        percentage: maxPercentage,
      };
    }

    return null;
  }

  /**
   * Get recent cost entries
   */
  getRecentEntries(limit: number = 50): CostEntry[] {
    return this.costs.slice(-limit).reverse();
  }

  /**
   * Clear old entries (keep last 30 days)
   */
  private cleanupOldEntries() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    this.costs = this.costs.filter((entry) => new Date(entry.timestamp) >= thirtyDaysAgo);
    this.saveToStorage();
  }

  /**
   * Setup periodic cleanup (daily)
   */
  private setupPeriodicCleanup() {
    // Clean up old entries every 24 hours
    setInterval(() => {
      this.cleanupOldEntries();
    }, 24 * 60 * 60 * 1000);
  }

  /**
   * Export cost data for analysis
   */
  exportData(): {
    costs: CostEntry[];
    summary: CostSummary;
    budget: BudgetConfig;
    exportDate: Date;
  } {
    return {
      costs: this.costs,
      summary: this.getSummary(),
      budget: this.budget,
      exportDate: new Date(),
    };
  }

  /**
   * Update budget configuration
   */
  updateBudget(config: Partial<BudgetConfig>) {
    this.budget = { ...this.budget, ...config };
    this.saveToStorage();
  }

  /**
   * Get current budget configuration
   */
  getBudget(): BudgetConfig {
    return { ...this.budget };
  }

  /**
   * Reset monthly costs (call at month start)
   */
  resetMonthly() {
    // Archive old data or just log it
    console.log('Monthly costs reset. Previous month summary:', this.getSummary());
  }

  /**
   * Save to localStorage
   */
  private saveToStorage() {
    try {
      const data = {
        costs: this.costs.slice(-1000), // Keep last 1000 entries
        budget: this.budget,
      };
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save cost tracker data:', error);
    }
  }

  /**
   * Load from localStorage
   */
  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        this.costs = data.costs || [];
        this.budget = data.budget || this.budget;

        // Convert timestamp strings back to Date objects
        this.costs = this.costs.map((entry) => ({
          ...entry,
          timestamp: new Date(entry.timestamp),
          usage: {
            ...entry.usage,
            timestamp: new Date(entry.usage.timestamp),
          },
        }));
      }
    } catch (error) {
      console.error('Failed to load cost tracker data:', error);
    }
  }

  /**
   * Get estimated cost for a planned request
   */
  estimateCost(provider: AIProvider, estimatedTokens: number): {
    cost: number;
    isFree: boolean;
    message: string;
  } {
    const pricing = this.providerCosts[provider];
    const isFree = pricing.freeTier &&
      (provider === 'gemini' || provider === 'groq' || provider === 'huggingface');

    if (isFree) {
      return {
        cost: 0,
        isFree: true,
        message: `${provider} is on free tier - no cost`,
      };
    }

    const cost = (estimatedTokens / 1_000_000) *
      ((pricing.inputCostPer1M + pricing.outputCostPer1M) / 2);

    return {
      cost,
      isFree: false,
      message: `Estimated cost: $${cost.toFixed(6)} for ${estimatedTokens} tokens`,
    };
  }
}

// Singleton instance
export const costTracker = new CostTracker();

// Convenience functions
export function trackAIRequest(
  provider: AIProvider,
  usage: TokenUsage,
  requestType?: string
): CostEntry {
  return costTracker.trackRequest(provider, usage, requestType);
}

export function getCostSummary(): CostSummary {
  return costTracker.getSummary();
}

export function checkBudget() {
  return costTracker.checkBudgetAlerts();
}
