/**
 * Text-to-Speech System for S21-A24
 *
 * Voices:
 * - Susan: Professional British female
 * - Agnes: Warm encouraging female
 *
 * Uses browser-based Web Speech API with fallback support
 */

export type PersonaVoice = 'susan' | 'agnes';

export interface TTSConfig {
  enabled: boolean;
  volume: number; // 0.0 to 1.0
  rate: number; // 0.1 to 10 (1 = normal)
  pitch: number; // 0 to 2 (1 = normal)
  language: string;
  preferredVoice?: string;
}

export interface VoiceProfile {
  persona: PersonaVoice;
  name: string;
  characteristics: string;
  voicePatterns: string[];
  preferredRate: number;
  preferredPitch: number;
  preferredVolume: number;
}

const VOICE_PROFILES: Record<PersonaVoice, VoiceProfile> = {
  susan: {
    persona: 'susan',
    name: 'Susan',
    characteristics: 'Professional British female - clear, confident, expert',
    voicePatterns: [
      'Google UK English Female',
      'Microsoft Hazel - English (Great Britain)',
      'Samantha',
      'Karen',
      'Victoria',
    ],
    preferredRate: 1.0,
    preferredPitch: 1.1,
    preferredVolume: 0.9,
  },
  agnes: {
    persona: 'agnes',
    name: 'Agnes',
    characteristics: 'Warm encouraging female - friendly, supportive, caring',
    voicePatterns: [
      'Google US English Female',
      'Microsoft Zira - English (United States)',
      'Samantha',
      'Ava',
      'Allison',
    ],
    preferredRate: 0.95,
    preferredPitch: 1.15,
    preferredVolume: 1.0,
  },
};

class TextToSpeech {
  private synthesis: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private currentPersona: PersonaVoice = 'susan';
  private isSpeaking: boolean = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  private config: TTSConfig = {
    enabled: true,
    volume: 0.9,
    rate: 1.0,
    pitch: 1.0,
    language: 'en-US',
  };

  private callbacks = {
    onStart: [] as Array<() => void>,
    onEnd: [] as Array<() => void>,
    onError: [] as Array<(error: Error) => void>,
  };

  constructor() {
    this.initializeSynthesis();
  }

  /**
   * Initialize Web Speech Synthesis
   */
  private initializeSynthesis(): boolean {
    if (!window.speechSynthesis) {
      console.error('[TTS] Speech synthesis not supported');
      return false;
    }

    this.synthesis = window.speechSynthesis;

    // Load available voices
    this.loadVoices();

    // Voices may load asynchronously
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = () => {
        this.loadVoices();
      };
    }

    console.log('[TTS] Text-to-speech initialized');
    return true;
  }

  /**
   * Load available voices
   */
  private loadVoices(): void {
    if (!this.synthesis) return;

    this.voices = this.synthesis.getVoices();
    console.log('[TTS] Loaded voices:', this.voices.length);
    console.log(
      '[TTS] Available voices:',
      this.voices.map((v) => v.name)
    );
  }

  /**
   * Find best matching voice for persona
   */
  private findVoiceForPersona(persona: PersonaVoice): SpeechSynthesisVoice | null {
    if (this.voices.length === 0) {
      this.loadVoices();
    }

    const profile = VOICE_PROFILES[persona];

    // Try to find exact match from voice patterns
    for (const pattern of profile.voicePatterns) {
      const voice = this.voices.find((v) =>
        v.name.toLowerCase().includes(pattern.toLowerCase())
      );
      if (voice) {
        console.log(`[TTS] Found voice for ${persona}:`, voice.name);
        return voice;
      }
    }

    // Fallback: Find any female voice
    const femaleVoice = this.voices.find(
      (v) =>
        v.name.toLowerCase().includes('female') ||
        v.name.toLowerCase().includes('woman') ||
        v.name.toLowerCase().includes('samantha') ||
        v.name.toLowerCase().includes('victoria') ||
        v.name.toLowerCase().includes('karen')
    );

    if (femaleVoice) {
      console.log(`[TTS] Using fallback voice for ${persona}:`, femaleVoice.name);
      return femaleVoice;
    }

    // Last resort: Use default voice
    console.warn(`[TTS] No suitable voice found for ${persona}, using default`);
    return this.voices[0] || null;
  }

  /**
   * Speak text with current persona voice
   */
  speak(text: string, persona?: PersonaVoice): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synthesis || !this.config.enabled) {
        reject(new Error('TTS not available or disabled'));
        return;
      }

      // Stop any current speech
      this.stop();

      // Use provided persona or current
      const activePersona = persona || this.currentPersona;
      const profile = VOICE_PROFILES[activePersona];

      // Create utterance
      const utterance = new SpeechSynthesisUtterance(text);
      this.currentUtterance = utterance;

      // Set voice
      const voice = this.findVoiceForPersona(activePersona);
      if (voice) {
        utterance.voice = voice;
      }

      // Apply persona-specific settings
      utterance.volume = profile.preferredVolume * this.config.volume;
      utterance.rate = profile.preferredRate * this.config.rate;
      utterance.pitch = profile.preferredPitch * this.config.pitch;
      utterance.lang = this.config.language;

      // Event handlers
      utterance.onstart = () => {
        this.isSpeaking = true;
        console.log(`[TTS] Speaking as ${activePersona}:`, text);
        this.callbacks.onStart.forEach((cb) => cb());
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        this.currentUtterance = null;
        console.log(`[TTS] Finished speaking`);
        this.callbacks.onEnd.forEach((cb) => cb());
        resolve();
      };

      utterance.onerror = (event) => {
        this.isSpeaking = false;
        this.currentUtterance = null;
        const error = new Error(`TTS error: ${event.error}`);
        console.error('[TTS] Error:', error);
        this.callbacks.onError.forEach((cb) => cb(error));
        reject(error);
      };

      // Speak
      this.synthesis.speak(utterance);
    });
  }

  /**
   * Stop current speech
   */
  stop(): void {
    if (!this.synthesis) return;

    if (this.synthesis.speaking) {
      this.synthesis.cancel();
      this.isSpeaking = false;
      this.currentUtterance = null;
      console.log('[TTS] Stopped speaking');
    }
  }

  /**
   * Pause current speech
   */
  pause(): void {
    if (!this.synthesis || !this.isSpeaking) return;

    this.synthesis.pause();
    console.log('[TTS] Paused speaking');
  }

  /**
   * Resume paused speech
   */
  resume(): void {
    if (!this.synthesis) return;

    this.synthesis.resume();
    console.log('[TTS] Resumed speaking');
  }

  /**
   * Set current persona
   */
  setPersona(persona: PersonaVoice): void {
    this.currentPersona = persona;
    console.log(`[TTS] Switched to ${persona} voice`);
  }

  /**
   * Get current persona
   */
  getPersona(): PersonaVoice {
    return this.currentPersona;
  }

  /**
   * Get persona profile
   */
  getPersonaProfile(persona?: PersonaVoice): VoiceProfile {
    return VOICE_PROFILES[persona || this.currentPersona];
  }

  /**
   * Update configuration
   */
  configure(config: Partial<TTSConfig>): void {
    this.config = { ...this.config, ...config };
    console.log('[TTS] Configuration updated:', this.config);
  }

  /**
   * Get available voices
   */
  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }

  /**
   * Test voice with sample text
   */
  async testVoice(persona: PersonaVoice): Promise<void> {
    const profile = VOICE_PROFILES[persona];
    const testText = `Hi, I'm ${profile.name}. ${profile.characteristics}. How can I help you today?`;

    try {
      await this.speak(testText, persona);
    } catch (error) {
      console.error(`[TTS] Failed to test ${persona} voice:`, error);
      throw error;
    }
  }

  /**
   * Register callbacks
   */
  onStart(callback: () => void): () => void {
    this.callbacks.onStart.push(callback);
    return () => {
      const index = this.callbacks.onStart.indexOf(callback);
      if (index > -1) this.callbacks.onStart.splice(index, 1);
    };
  }

  onEnd(callback: () => void): () => void {
    this.callbacks.onEnd.push(callback);
    return () => {
      const index = this.callbacks.onEnd.indexOf(callback);
      if (index > -1) this.callbacks.onEnd.splice(index, 1);
    };
  }

  onError(callback: (error: Error) => void): () => void {
    this.callbacks.onError.push(callback);
    return () => {
      const index = this.callbacks.onError.indexOf(callback);
      if (index > -1) this.callbacks.onError.splice(index, 1);
    };
  }

  /**
   * Get current status
   */
  getStatus(): {
    speaking: boolean;
    persona: PersonaVoice;
    config: TTSConfig;
    supported: boolean;
    voicesLoaded: number;
  } {
    return {
      speaking: this.isSpeaking,
      persona: this.currentPersona,
      config: this.config,
      supported: this.synthesis !== null,
      voicesLoaded: this.voices.length,
    };
  }

  /**
   * Check if browser supports TTS
   */
  static isSupported(): boolean {
    return 'speechSynthesis' in window;
  }
}

// Singleton instance
export const textToSpeech = new TextToSpeech();

// Export for React hooks
export function useTextToSpeech() {
  return textToSpeech;
}
