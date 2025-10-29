/**
 * S21-A24 Health Checker
 * Monitor AI provider availability and performance
 *
 * Features:
 * - Periodic health checks
 * - Latency monitoring
 * - Automatic fallback on failure
 * - Status dashboard data
 * - Historical uptime tracking
 */

import { AIProvider } from './ai-router';
import Groq from 'groq-sdk';
import Together from 'together-ai';
import { HfInference } from '@huggingface/inference';

export interface HealthStatus {
  provider: AIProvider;
  isHealthy: boolean;
  latency: number; // in milliseconds
  lastCheck: Date;
  errorMessage?: string;
  consecutiveFailures: number;
  uptime: number; // percentage
}

export interface HealthCheckResult {
  success: boolean;
  latency: number;
  error?: string;
}

class HealthChecker {
  private healthStatus: Record<AIProvider, HealthStatus> = {
    gemini: {
      provider: 'gemini',
      isHealthy: false,
      latency: 0,
      lastCheck: new Date(),
      consecutiveFailures: 0,
      uptime: 100,
    },
    groq: {
      provider: 'groq',
      isHealthy: false,
      latency: 0,
      lastCheck: new Date(),
      consecutiveFailures: 0,
      uptime: 100,
    },
    together: {
      provider: 'together',
      isHealthy: false,
      latency: 0,
      lastCheck: new Date(),
      consecutiveFailures: 0,
      uptime: 100,
    },
    huggingface: {
      provider: 'huggingface',
      isHealthy: false,
      latency: 0,
      lastCheck: new Date(),
      consecutiveFailures: 0,
      uptime: 100,
    },
  };

  private checkInterval: NodeJS.Timeout | null = null;
  private storageKey = 's21-a24-health-status';

  // API keys from environment
  private apiKeys = {
    gemini: import.meta.env.VITE_GEMINI_API_KEY,
    groq: import.meta.env.VITE_GROQ_API_KEY,
    together: import.meta.env.VITE_TOGETHER_API_KEY,
    huggingface: import.meta.env.VITE_HF_API_KEY,
  };

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Start periodic health checks
   */
  startMonitoring(intervalMinutes: number = 5) {
    // Initial check
    this.checkAllProviders();

    // Periodic checks
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    this.checkInterval = setInterval(() => {
      this.checkAllProviders();
    }, intervalMinutes * 60 * 1000);

    console.log(`Health monitoring started (checking every ${intervalMinutes} minutes)`);
  }

  /**
   * Stop monitoring
   */
  stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      console.log('Health monitoring stopped');
    }
  }

  /**
   * Check all providers
   */
  async checkAllProviders(): Promise<Record<AIProvider, HealthStatus>> {
    const providers: AIProvider[] = ['gemini', 'groq', 'together', 'huggingface'];

    await Promise.all(providers.map((provider) => this.checkProvider(provider)));

    this.saveToStorage();
    return this.healthStatus;
  }

  /**
   * Check a specific provider
   */
  async checkProvider(provider: AIProvider): Promise<HealthStatus> {
    const apiKey = this.apiKeys[provider];

    if (!apiKey) {
      this.updateStatus(provider, {
        isHealthy: false,
        latency: 0,
        errorMessage: 'API key not configured',
        consecutiveFailures: this.healthStatus[provider].consecutiveFailures + 1,
      });
      return this.healthStatus[provider];
    }

    let result: HealthCheckResult;

    try {
      switch (provider) {
        case 'gemini':
          result = await this.checkGemini(apiKey);
          break;
        case 'groq':
          result = await this.checkGroq(apiKey);
          break;
        case 'together':
          result = await this.checkTogether(apiKey);
          break;
        case 'huggingface':
          result = await this.checkHuggingFace(apiKey);
          break;
        default:
          result = { success: false, latency: 0, error: 'Unknown provider' };
      }

      this.updateStatus(provider, {
        isHealthy: result.success,
        latency: result.latency,
        errorMessage: result.error,
        consecutiveFailures: result.success
          ? 0
          : this.healthStatus[provider].consecutiveFailures + 1,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.updateStatus(provider, {
        isHealthy: false,
        latency: 0,
        errorMessage,
        consecutiveFailures: this.healthStatus[provider].consecutiveFailures + 1,
      });
    }

    return this.healthStatus[provider];
  }

  /**
   * Check Gemini health
   */
  private async checkGemini(apiKey: string): Promise<HealthCheckResult> {
    const startTime = Date.now();

    try {
      const { GoogleGenerativeAI } = await import('@google/genai');
      const genai = new GoogleGenerativeAI(apiKey);
      const model = genai.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

      await model.generateContent('Hi');

      const latency = Date.now() - startTime;
      return { success: true, latency };
    } catch (error) {
      const latency = Date.now() - startTime;
      return {
        success: false,
        latency,
        error: error instanceof Error ? error.message : 'Health check failed',
      };
    }
  }

  /**
   * Check Groq health
   */
  private async checkGroq(apiKey: string): Promise<HealthCheckResult> {
    const startTime = Date.now();

    try {
      const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });

      await groq.chat.completions.create({
        messages: [{ role: 'user', content: 'Hi' }],
        model: 'llama-3.3-70b-versatile',
        max_tokens: 5,
      });

      const latency = Date.now() - startTime;
      return { success: true, latency };
    } catch (error) {
      const latency = Date.now() - startTime;
      return {
        success: false,
        latency,
        error: error instanceof Error ? error.message : 'Health check failed',
      };
    }
  }

  /**
   * Check Together AI health
   */
  private async checkTogether(apiKey: string): Promise<HealthCheckResult> {
    const startTime = Date.now();

    try {
      const together = new Together({ apiKey });

      await together.chat.completions.create({
        messages: [{ role: 'user', content: 'Hi' }],
        model: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
        max_tokens: 5,
      });

      const latency = Date.now() - startTime;
      return { success: true, latency };
    } catch (error) {
      const latency = Date.now() - startTime;
      return {
        success: false,
        latency,
        error: error instanceof Error ? error.message : 'Health check failed',
      };
    }
  }

  /**
   * Check HuggingFace health
   */
  private async checkHuggingFace(apiKey: string): Promise<HealthCheckResult> {
    const startTime = Date.now();

    try {
      const hf = new HfInference(apiKey);

      await hf.textGeneration({
        model: 'meta-llama/Llama-3.2-3B-Instruct',
        inputs: 'Hi',
        parameters: { max_new_tokens: 5 },
      });

      const latency = Date.now() - startTime;
      return { success: true, latency };
    } catch (error) {
      const latency = Date.now() - startTime;
      return {
        success: false,
        latency,
        error: error instanceof Error ? error.message : 'Health check failed',
      };
    }
  }

  /**
   * Update provider status
   */
  private updateStatus(
    provider: AIProvider,
    update: Partial<Omit<HealthStatus, 'provider' | 'lastCheck' | 'uptime'>>
  ) {
    const current = this.healthStatus[provider];

    // Calculate uptime (simple rolling average)
    let uptime = current.uptime;
    if (update.isHealthy !== undefined) {
      uptime = uptime * 0.95 + (update.isHealthy ? 100 : 0) * 0.05;
    }

    this.healthStatus[provider] = {
      ...current,
      ...update,
      lastCheck: new Date(),
      uptime,
    };
  }

  /**
   * Get status of a specific provider
   */
  getStatus(provider: AIProvider): HealthStatus {
    return { ...this.healthStatus[provider] };
  }

  /**
   * Get all provider statuses
   */
  getAllStatuses(): Record<AIProvider, HealthStatus> {
    return { ...this.healthStatus };
  }

  /**
   * Get healthy providers
   */
  getHealthyProviders(): AIProvider[] {
    return (Object.keys(this.healthStatus) as AIProvider[]).filter(
      (provider) => this.healthStatus[provider].isHealthy
    );
  }

  /**
   * Get fastest healthy provider
   */
  getFastestProvider(): AIProvider | null {
    const healthy = this.getHealthyProviders();

    if (healthy.length === 0) return null;

    return healthy.reduce((fastest, current) => {
      const currentLatency = this.healthStatus[current].latency;
      const fastestLatency = this.healthStatus[fastest].latency;
      return currentLatency < fastestLatency ? current : fastest;
    });
  }

  /**
   * Check if any provider is available
   */
  hasHealthyProvider(): boolean {
    return this.getHealthyProviders().length > 0;
  }

  /**
   * Get fallback provider order
   */
  getFallbackOrder(): AIProvider[] {
    const providers = Object.entries(this.healthStatus)
      .filter(([_, status]) => status.isHealthy)
      .sort((a, b) => {
        // Sort by: consecutive failures (asc), then latency (asc)
        if (a[1].consecutiveFailures !== b[1].consecutiveFailures) {
          return a[1].consecutiveFailures - b[1].consecutiveFailures;
        }
        return a[1].latency - b[1].latency;
      })
      .map(([provider]) => provider as AIProvider);

    return providers;
  }

  /**
   * Get summary for dashboard
   */
  getSummary(): {
    totalProviders: number;
    healthyProviders: number;
    unhealthyProviders: number;
    averageLatency: number;
    averageUptime: number;
    fastestProvider: AIProvider | null;
  } {
    const providers = Object.values(this.healthStatus);
    const healthy = providers.filter((p) => p.isHealthy);

    const totalLatency = healthy.reduce((sum, p) => sum + p.latency, 0);
    const totalUptime = providers.reduce((sum, p) => sum + p.uptime, 0);

    return {
      totalProviders: providers.length,
      healthyProviders: healthy.length,
      unhealthyProviders: providers.length - healthy.length,
      averageLatency: healthy.length > 0 ? totalLatency / healthy.length : 0,
      averageUptime: providers.length > 0 ? totalUptime / providers.length : 0,
      fastestProvider: this.getFastestProvider(),
    };
  }

  /**
   * Save to localStorage
   */
  private saveToStorage() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.healthStatus));
    } catch (error) {
      console.error('Failed to save health status:', error);
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

        // Restore and convert dates
        Object.keys(data).forEach((provider) => {
          this.healthStatus[provider as AIProvider] = {
            ...data[provider],
            lastCheck: new Date(data[provider].lastCheck),
          };
        });
      }
    } catch (error) {
      console.error('Failed to load health status:', error);
    }
  }

  /**
   * Export health data for analysis
   */
  exportData() {
    return {
      status: this.healthStatus,
      summary: this.getSummary(),
      exportDate: new Date(),
    };
  }
}

// Singleton instance
export const healthChecker = new HealthChecker();

// Convenience functions
export function startHealthMonitoring(intervalMinutes?: number) {
  healthChecker.startMonitoring(intervalMinutes);
}

export function checkProviderHealth(provider: AIProvider) {
  return healthChecker.checkProvider(provider);
}

export function getHealthyProviders() {
  return healthChecker.getHealthyProviders();
}

export function getHealthSummary() {
  return healthChecker.getSummary();
}
