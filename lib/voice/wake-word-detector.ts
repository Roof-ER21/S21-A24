/**
 * Wake Word Detector for S21-A24
 *
 * Detects wake words: "Hey Susan", "Hey Agnes", "Susan", "Agnes"
 * Uses Web Speech API with optimized pattern matching
 * Low-power background listening for field use
 */

export type WakeWord = 'susan' | 'agnes';

export interface WakeWordConfig {
  enabled: boolean;
  sensitivity: 'low' | 'medium' | 'high';
  continuous: boolean;
  language: string;
}

export interface WakeWordDetection {
  word: WakeWord;
  confidence: number;
  timestamp: Date;
  rawTranscript: string;
}

type WakeWordCallback = (detection: WakeWordDetection) => void;

class WakeWordDetector {
  private recognition: SpeechRecognition | null = null;
  private isListening: boolean = false;
  private callbacks: WakeWordCallback[] = [];
  private config: WakeWordConfig = {
    enabled: true,
    sensitivity: 'medium',
    continuous: true,
    language: 'en-US',
  };

  // Wake word patterns (case-insensitive)
  private patterns = {
    susan: [
      /\b(hey\s+)?susan\b/i,
      /\bsusan\b/i,
      /\bsuzy\b/i, // Common misrecognition
      /\bsusanne?\b/i, // Variation
    ],
    agnes: [
      /\b(hey\s+)?agnes\b/i,
      /\bagnes\b/i,
      /\bagness\b/i, // Common misrecognition
      /\binnes\b/i, // Variation
    ],
  };

  constructor() {
    this.initializeRecognition();
  }

  /**
   * Initialize Web Speech Recognition
   */
  private initializeRecognition(): boolean {
    // Check browser support
    const SpeechRecognition =
      window.SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error('Wake word detection not supported in this browser');
      return false;
    }

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 3;
      this.recognition.lang = this.config.language;

      // Event handlers
      this.recognition.onresult = this.handleRecognitionResult.bind(this);
      this.recognition.onerror = this.handleRecognitionError.bind(this);
      this.recognition.onend = this.handleRecognitionEnd.bind(this);

      console.log('Wake word detector initialized');
      return true;
    } catch (error) {
      console.error('Failed to initialize wake word detector:', error);
      return false;
    }
  }

  /**
   * Handle speech recognition results
   */
  private handleRecognitionResult(event: SpeechRecognitionEvent): void {
    // Process both interim and final results for faster detection
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      const transcript = result[0].transcript.toLowerCase().trim();
      const confidence = result[0].confidence;

      console.log('[Wake Word] Heard:', transcript, 'Confidence:', confidence);

      // Check for wake words
      const detection = this.detectWakeWord(transcript, confidence);
      if (detection) {
        console.log('[Wake Word] Detected:', detection.word);
        this.notifyCallbacks(detection);
      }
    }
  }

  /**
   * Detect wake word in transcript
   */
  private detectWakeWord(
    transcript: string,
    confidence: number
  ): WakeWordDetection | null {
    // Adjust confidence threshold based on sensitivity
    const thresholds = {
      low: 0.3,
      medium: 0.5,
      high: 0.7,
    };
    const threshold = thresholds[this.config.sensitivity];

    // Check Susan patterns
    for (const pattern of this.patterns.susan) {
      if (pattern.test(transcript)) {
        return {
          word: 'susan',
          confidence,
          timestamp: new Date(),
          rawTranscript: transcript,
        };
      }
    }

    // Check Agnes patterns
    for (const pattern of this.patterns.agnes) {
      if (pattern.test(transcript)) {
        return {
          word: 'agnes',
          confidence,
          timestamp: new Date(),
          rawTranscript: transcript,
        };
      }
    }

    return null;
  }

  /**
   * Handle recognition errors
   */
  private handleRecognitionError(event: SpeechRecognitionErrorEvent): void {
    console.error('[Wake Word] Recognition error:', event.error);

    // Auto-restart on network errors (common in field use)
    if (event.error === 'network' && this.isListening) {
      console.log('[Wake Word] Restarting after network error...');
      setTimeout(() => this.start(), 1000);
    }

    // Auto-restart on no-speech timeout
    if (event.error === 'no-speech' && this.isListening) {
      console.log('[Wake Word] Restarting after timeout...');
      this.start();
    }
  }

  /**
   * Handle recognition end
   */
  private handleRecognitionEnd(): void {
    console.log('[Wake Word] Recognition ended');

    // Auto-restart if continuous mode is enabled
    if (this.config.continuous && this.isListening) {
      console.log('[Wake Word] Restarting continuous listening...');
      setTimeout(() => this.start(), 100);
    }
  }

  /**
   * Notify all registered callbacks
   */
  private notifyCallbacks(detection: WakeWordDetection): void {
    this.callbacks.forEach((callback) => {
      try {
        callback(detection);
      } catch (error) {
        console.error('[Wake Word] Callback error:', error);
      }
    });
  }

  /**
   * Start listening for wake words
   */
  start(): boolean {
    if (!this.recognition) {
      console.error('[Wake Word] Recognition not initialized');
      return false;
    }

    if (this.isListening) {
      console.warn('[Wake Word] Already listening');
      return true;
    }

    try {
      this.recognition.start();
      this.isListening = true;
      console.log('[Wake Word] Started listening');
      return true;
    } catch (error) {
      console.error('[Wake Word] Failed to start:', error);
      return false;
    }
  }

  /**
   * Stop listening for wake words
   */
  stop(): void {
    if (!this.recognition || !this.isListening) {
      return;
    }

    try {
      this.recognition.stop();
      this.isListening = false;
      console.log('[Wake Word] Stopped listening');
    } catch (error) {
      console.error('[Wake Word] Failed to stop:', error);
    }
  }

  /**
   * Register callback for wake word detections
   */
  onWakeWord(callback: WakeWordCallback): () => void {
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
   * Update configuration
   */
  configure(config: Partial<WakeWordConfig>): void {
    this.config = { ...this.config, ...config };

    // Update recognition settings if available
    if (this.recognition) {
      this.recognition.continuous = this.config.continuous;
      this.recognition.lang = this.config.language;
    }

    console.log('[Wake Word] Configuration updated:', this.config);
  }

  /**
   * Get current status
   */
  getStatus(): {
    listening: boolean;
    supported: boolean;
    config: WakeWordConfig;
  } {
    return {
      listening: this.isListening,
      supported: this.recognition !== null,
      config: this.config,
    };
  }

  /**
   * Check if browser supports wake word detection
   */
  static isSupported(): boolean {
    return !!(
      window.SpeechRecognition || (window as any).webkitSpeechRecognition
    );
  }
}

// Singleton instance
export const wakeWordDetector = new WakeWordDetector();

// Export for React hooks
export function useWakeWordDetector() {
  return wakeWordDetector;
}

// Type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
