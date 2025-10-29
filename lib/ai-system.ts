/**
 * S21-A24 AI System Initialization
 * Central hub for AI router, cost tracker, and health checker
 */

import { aiRouter, routeAIRequest, type RequestContext, type AIProvider } from './ai-router';
import { costTracker, trackAIRequest, type TokenUsage } from './cost-tracker';
import { healthChecker, startHealthMonitoring } from './health-checker';
import Groq from 'groq-sdk';
import Together from 'together-ai';
import { HfInference } from '@huggingface/inference';
import { GoogleGenerativeAI } from '@google/genai';

export interface AIRequest {
  message: string;
  context?: RequestContext;
  stream?: boolean;
}

export interface AIResponse {
  content: string;
  provider: AIProvider;
  usage: TokenUsage;
  cost: number;
  latency: number;
}

class AISystem {
  private geminiClient: GoogleGenerativeAI | null = null;
  private groqClient: Groq | null = null;
  private togetherClient: Together | null = null;
  private hfClient: HfInference | null = null;

  private initialized = false;

  /**
   * Initialize the AI system
   */
  async initialize() {
    if (this.initialized) {
      console.log('AI System already initialized');
      return;
    }

    console.log('Initializing S21-A24 AI System...');

    // Initialize API clients
    this.initializeClients();

    // Start health monitoring (check every 5 minutes)
    const healthInterval = parseInt(import.meta.env.VITE_HEALTH_CHECK_INTERVAL || '5', 10);
    startHealthMonitoring(healthInterval);

    // Run initial health check
    await healthChecker.checkAllProviders();

    this.initialized = true;
    console.log('AI System initialized successfully!');

    // Log summary
    const summary = healthChecker.getSummary();
    console.log(`Providers: ${summary.healthyProviders}/${summary.totalProviders} healthy`);
    console.log(`Avg latency: ${summary.averageLatency.toFixed(0)}ms`);
  }

  /**
   * Initialize API clients based on available keys
   */
  private initializeClients() {
    const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const groqKey = import.meta.env.VITE_GROQ_API_KEY;
    const togetherKey = import.meta.env.VITE_TOGETHER_API_KEY;
    const hfKey = import.meta.env.VITE_HF_API_KEY;

    if (geminiKey) {
      this.geminiClient = new GoogleGenerativeAI(geminiKey);
      console.log('✓ Gemini client initialized');
    }

    if (groqKey) {
      this.groqClient = new Groq({ apiKey: groqKey, dangerouslyAllowBrowser: true });
      console.log('✓ Groq client initialized');
    }

    if (togetherKey) {
      this.togetherClient = new Together({ apiKey: togetherKey });
      console.log('✓ Together AI client initialized');
    }

    if (hfKey) {
      this.hfClient = new HfInference(hfKey);
      console.log('✓ HuggingFace client initialized');
    }
  }

  /**
   * Send a request to the optimal AI provider
   */
  async sendRequest(request: AIRequest): Promise<AIResponse> {
    if (!this.initialized) {
      await this.initialize();
    }

    const startTime = Date.now();

    // Route to optimal provider
    const context: RequestContext = request.context || {
      type: 'text',
      urgency: 'medium',
      estimatedTokens: 1000,
    };

    const provider = routeAIRequest(context);
    console.log(`Routing to ${provider} for ${context.type} request`);

    // Send request to provider
    let response: string;
    let usage: TokenUsage;

    try {
      switch (provider) {
        case 'gemini':
          ({ response, usage } = await this.sendToGemini(request.message));
          break;
        case 'groq':
          ({ response, usage } = await this.sendToGroq(request.message));
          break;
        case 'together':
          ({ response, usage } = await this.sendToTogether(request.message));
          break;
        case 'huggingface':
          ({ response, usage } = await this.sendToHuggingFace(request.message));
          break;
        default:
          throw new Error(`Unknown provider: ${provider}`);
      }

      const latency = Date.now() - startTime;

      // Track cost
      const costEntry = trackAIRequest(provider, usage, context.type);

      // Update provider health status
      aiRouter.updateProviderStatus(provider, {
        available: true,
        latency,
        errorRate: 0,
      });

      // Increment Gemini usage if needed
      if (provider === 'gemini') {
        aiRouter.incrementGeminiUsage();
      }

      return {
        content: response,
        provider,
        usage,
        cost: costEntry.cost,
        latency,
      };
    } catch (error) {
      console.error(`Error with ${provider}:`, error);

      // Update provider error status
      aiRouter.updateProviderStatus(provider, {
        available: false,
        errorRate: 1,
      });

      // Try fallback
      throw error;
    }
  }

  /**
   * Send request to Gemini
   */
  private async sendToGemini(
    message: string
  ): Promise<{ response: string; usage: TokenUsage }> {
    if (!this.geminiClient) {
      throw new Error('Gemini client not initialized');
    }

    const model = this.geminiClient.getGenerativeModel({
      model: import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.0-flash-exp',
    });

    const result = await model.generateContent(message);
    const response = result.response.text();

    // Gemini doesn't return usage in this version, estimate
    const usage: TokenUsage = {
      promptTokens: Math.ceil(message.length / 4),
      completionTokens: Math.ceil(response.length / 4),
      totalTokens: 0,
      timestamp: new Date(),
    };
    usage.totalTokens = usage.promptTokens + usage.completionTokens;

    return { response, usage };
  }

  /**
   * Send request to Groq
   */
  private async sendToGroq(
    message: string
  ): Promise<{ response: string; usage: TokenUsage }> {
    if (!this.groqClient) {
      throw new Error('Groq client not initialized');
    }

    const completion = await this.groqClient.chat.completions.create({
      messages: [{ role: 'user', content: message }],
      model: import.meta.env.VITE_GROQ_MODEL || 'llama-3.3-70b-versatile',
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content || '';

    const usage: TokenUsage = {
      promptTokens: completion.usage?.prompt_tokens || 0,
      completionTokens: completion.usage?.completion_tokens || 0,
      totalTokens: completion.usage?.total_tokens || 0,
      timestamp: new Date(),
    };

    return { response, usage };
  }

  /**
   * Send request to Together AI
   */
  private async sendToTogether(
    message: string
  ): Promise<{ response: string; usage: TokenUsage }> {
    if (!this.togetherClient) {
      throw new Error('Together client not initialized');
    }

    const completion = await this.togetherClient.chat.completions.create({
      messages: [{ role: 'user', content: message }],
      model:
        import.meta.env.VITE_TOGETHER_MODEL ||
        'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content || '';

    const usage: TokenUsage = {
      promptTokens: completion.usage?.prompt_tokens || 0,
      completionTokens: completion.usage?.completion_tokens || 0,
      totalTokens: completion.usage?.total_tokens || 0,
      timestamp: new Date(),
    };

    return { response, usage };
  }

  /**
   * Send request to HuggingFace
   */
  private async sendToHuggingFace(
    message: string
  ): Promise<{ response: string; usage: TokenUsage }> {
    if (!this.hfClient) {
      throw new Error('HuggingFace client not initialized');
    }

    const result = await this.hfClient.textGeneration({
      model: import.meta.env.VITE_HF_MODEL || 'meta-llama/Llama-3.2-3B-Instruct',
      inputs: message,
      parameters: {
        max_new_tokens: 512,
        temperature: 0.7,
      },
    });

    const response = result.generated_text;

    // HF doesn't return token counts, estimate
    const usage: TokenUsage = {
      promptTokens: Math.ceil(message.length / 4),
      completionTokens: Math.ceil(response.length / 4),
      totalTokens: 0,
      timestamp: new Date(),
    };
    usage.totalTokens = usage.promptTokens + usage.completionTokens;

    return { response, usage };
  }

  /**
   * Get system status
   */
  getStatus() {
    return {
      initialized: this.initialized,
      health: healthChecker.getSummary(),
      costs: costTracker.getSummary(),
      budget: costTracker.checkBudgetAlerts(),
    };
  }
}

// Singleton instance
export const aiSystem = new AISystem();

// Convenience function
export async function sendAIRequest(request: AIRequest): Promise<AIResponse> {
  return aiSystem.sendRequest(request);
}

// Auto-initialize on import
if (typeof window !== 'undefined') {
  aiSystem.initialize().catch(console.error);
}
