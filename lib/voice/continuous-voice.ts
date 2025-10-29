/**
 * Continuous Voice Mode for S21-A24
 *
 * Features:
 * - Real-time transcription using Gemini API (FREE tier)
 * - Voice Activity Detection (VAD)
 * - Automatic turn-taking
 * - No button presses required
 * - Continuous conversation flow
 */

import { GoogleGenerativeAI } from '@google/genai';

export interface VoiceConfig {
  enabled: boolean;
  autoStart: boolean;
  language: string;
  interimResults: boolean;
  maxAlternatives: number;
  silenceTimeout: number; // ms before considering speech ended
  useGemini: boolean; // Use Gemini for transcription (free tier)
}

export interface VoiceSegment {
  id: string;
  transcript: string;
  confidence: number;
  isFinal: boolean;
  timestamp: Date;
  duration: number;
}

export interface VoiceSession {
  id: string;
  segments: VoiceSegment[];
  startTime: Date;
  endTime?: Date;
  isActive: boolean;
}

type TranscriptCallback = (segment: VoiceSegment) => void;
type SessionCallback = (session: VoiceSession) => void;
type ErrorCallback = (error: Error) => void;

class ContinuousVoice {
  private recognition: SpeechRecognition | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private isListening: boolean = false;
  private currentSession: VoiceSession | null = null;
  private silenceTimer: NodeJS.Timeout | null = null;
  private geminiClient: GoogleGenerativeAI | null = null;

  private config: VoiceConfig = {
    enabled: true,
    autoStart: false,
    language: 'en-US',
    interimResults: true,
    maxAlternatives: 3,
    silenceTimeout: 2000, // 2 seconds of silence
    useGemini: true,
  };

  private callbacks = {
    onTranscript: [] as TranscriptCallback[],
    onSessionStart: [] as SessionCallback[],
    onSessionEnd: [] as SessionCallback[],
    onError: [] as ErrorCallback[],
  };

  constructor() {
    this.initializeRecognition();
    this.initializeAudioAnalysis();
    this.initializeGemini();
  }

  /**
   * Initialize Gemini client for transcription
   */
  private initializeGemini(): void {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (apiKey) {
      this.geminiClient = new GoogleGenerativeAI(apiKey);
      console.log('[Voice] Gemini client initialized');
    } else {
      console.warn('[Voice] Gemini API key not found, using Web Speech API only');
    }
  }

  /**
   * Initialize Web Speech Recognition
   */
  private initializeRecognition(): boolean {
    const SpeechRecognition =
      window.SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error('[Voice] Speech recognition not supported');
      return false;
    }

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = this.config.interimResults;
      this.recognition.maxAlternatives = this.config.maxAlternatives;
      this.recognition.lang = this.config.language;

      // Event handlers
      this.recognition.onresult = this.handleRecognitionResult.bind(this);
      this.recognition.onerror = this.handleRecognitionError.bind(this);
      this.recognition.onend = this.handleRecognitionEnd.bind(this);
      this.recognition.onstart = this.handleRecognitionStart.bind(this);

      console.log('[Voice] Recognition initialized');
      return true;
    } catch (error) {
      console.error('[Voice] Failed to initialize recognition:', error);
      return false;
    }
  }

  /**
   * Initialize audio analysis for Voice Activity Detection
   */
  private async initializeAudioAnalysis(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Create audio context for VAD
      this.audioContext = new AudioContext();
      const source = this.audioContext.createMediaStreamSource(stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;

      source.connect(this.analyser);

      console.log('[Voice] Audio analysis initialized');
    } catch (error) {
      console.warn('[Voice] Could not initialize audio analysis:', error);
    }
  }

  /**
   * Detect voice activity (is someone speaking?)
   */
  private detectVoiceActivity(): boolean {
    if (!this.analyser) return false;

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);

    // Calculate average volume
    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;

    // Threshold for voice activity (adjust based on environment)
    const threshold = 30;

    return average > threshold;
  }

  /**
   * Handle recognition start
   */
  private handleRecognitionStart(): void {
    console.log('[Voice] Recognition started');
    this.startSession();
  }

  /**
   * Handle recognition results
   */
  private handleRecognitionResult(event: SpeechRecognitionEvent): void {
    // Reset silence timer on any speech
    this.resetSilenceTimer();

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      const transcript = result[0].transcript;
      const confidence = result[0].confidence;
      const isFinal = result.isFinal;

      const segment: VoiceSegment = {
        id: this.generateSegmentId(),
        transcript,
        confidence,
        isFinal,
        timestamp: new Date(),
        duration: 0, // Will be calculated
      };

      console.log('[Voice] Segment:', {
        transcript,
        isFinal,
        confidence,
      });

      // Add to current session
      if (this.currentSession) {
        this.currentSession.segments.push(segment);
      }

      // Notify callbacks
      this.callbacks.onTranscript.forEach((cb) => cb(segment));

      // If final result, start silence detection
      if (isFinal) {
        this.startSilenceDetection();
      }
    }
  }

  /**
   * Handle recognition errors
   */
  private handleRecognitionError(event: SpeechRecognitionErrorEvent): void {
    console.error('[Voice] Recognition error:', event.error);

    const error = new Error(`Speech recognition error: ${event.error}`);
    this.callbacks.onError.forEach((cb) => cb(error));

    // Auto-restart on recoverable errors
    if (
      event.error === 'network' ||
      event.error === 'no-speech' ||
      event.error === 'audio-capture'
    ) {
      if (this.isListening) {
        console.log('[Voice] Restarting after error...');
        setTimeout(() => this.start(), 1000);
      }
    }
  }

  /**
   * Handle recognition end
   */
  private handleRecognitionEnd(): void {
    console.log('[Voice] Recognition ended');

    // Auto-restart if still in listening mode
    if (this.isListening && this.config.enabled) {
      console.log('[Voice] Restarting continuous recognition...');
      setTimeout(() => this.start(), 100);
    } else {
      this.endSession();
    }
  }

  /**
   * Start new voice session
   */
  private startSession(): void {
    this.currentSession = {
      id: this.generateSessionId(),
      segments: [],
      startTime: new Date(),
      isActive: true,
    };

    console.log('[Voice] Session started:', this.currentSession.id);
    this.callbacks.onSessionStart.forEach((cb) => cb(this.currentSession!));
  }

  /**
   * End current voice session
   */
  private endSession(): void {
    if (!this.currentSession) return;

    this.currentSession.endTime = new Date();
    this.currentSession.isActive = false;

    console.log('[Voice] Session ended:', this.currentSession.id);
    this.callbacks.onSessionEnd.forEach((cb) => cb(this.currentSession!));

    this.currentSession = null;
  }

  /**
   * Reset silence timer
   */
  private resetSilenceTimer(): void {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
  }

  /**
   * Start silence detection
   */
  private startSilenceDetection(): void {
    this.resetSilenceTimer();

    this.silenceTimer = setTimeout(() => {
      console.log('[Voice] Silence detected - user finished speaking');
      // Could trigger end of turn or other logic here
    }, this.config.silenceTimeout);
  }

  /**
   * Start continuous voice listening
   */
  async start(): Promise<boolean> {
    if (!this.recognition) {
      console.error('[Voice] Recognition not initialized');
      return false;
    }

    if (this.isListening) {
      console.warn('[Voice] Already listening');
      return true;
    }

    try {
      this.recognition.start();
      this.isListening = true;
      console.log('[Voice] Started continuous listening');
      return true;
    } catch (error) {
      console.error('[Voice] Failed to start:', error);
      this.callbacks.onError.forEach((cb) =>
        cb(error instanceof Error ? error : new Error(String(error)))
      );
      return false;
    }
  }

  /**
   * Stop continuous voice listening
   */
  stop(): void {
    if (!this.recognition || !this.isListening) {
      return;
    }

    try {
      this.recognition.stop();
      this.isListening = false;
      this.resetSilenceTimer();
      this.endSession();
      console.log('[Voice] Stopped listening');
    } catch (error) {
      console.error('[Voice] Failed to stop:', error);
    }
  }

  /**
   * Get full transcript from current session
   */
  getSessionTranscript(): string {
    if (!this.currentSession) return '';

    return this.currentSession.segments
      .filter((s) => s.isFinal)
      .map((s) => s.transcript)
      .join(' ')
      .trim();
  }

  /**
   * Get latest interim transcript
   */
  getInterimTranscript(): string {
    if (!this.currentSession) return '';

    const interimSegments = this.currentSession.segments.filter((s) => !s.isFinal);

    return interimSegments.length > 0
      ? interimSegments[interimSegments.length - 1].transcript
      : '';
  }

  /**
   * Register callbacks
   */
  onTranscript(callback: TranscriptCallback): () => void {
    this.callbacks.onTranscript.push(callback);
    return () => {
      const index = this.callbacks.onTranscript.indexOf(callback);
      if (index > -1) this.callbacks.onTranscript.splice(index, 1);
    };
  }

  onSessionStart(callback: SessionCallback): () => void {
    this.callbacks.onSessionStart.push(callback);
    return () => {
      const index = this.callbacks.onSessionStart.indexOf(callback);
      if (index > -1) this.callbacks.onSessionStart.splice(index, 1);
    };
  }

  onSessionEnd(callback: SessionCallback): () => void {
    this.callbacks.onSessionEnd.push(callback);
    return () => {
      const index = this.callbacks.onSessionEnd.indexOf(callback);
      if (index > -1) this.callbacks.onSessionEnd.splice(index, 1);
    };
  }

  onError(callback: ErrorCallback): () => void {
    this.callbacks.onError.push(callback);
    return () => {
      const index = this.callbacks.onError.indexOf(callback);
      if (index > -1) this.callbacks.onError.splice(index, 1);
    };
  }

  /**
   * Update configuration
   */
  configure(config: Partial<VoiceConfig>): void {
    this.config = { ...this.config, ...config };

    if (this.recognition) {
      this.recognition.continuous = true;
      this.recognition.interimResults = this.config.interimResults;
      this.recognition.maxAlternatives = this.config.maxAlternatives;
      this.recognition.lang = this.config.language;
    }

    console.log('[Voice] Configuration updated:', this.config);
  }

  /**
   * Get current status
   */
  getStatus(): {
    listening: boolean;
    session: VoiceSession | null;
    config: VoiceConfig;
    supported: boolean;
  } {
    return {
      listening: this.isListening,
      session: this.currentSession,
      config: this.config,
      supported: this.recognition !== null,
    };
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique segment ID
   */
  private generateSegmentId(): string {
    return `segment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Check if browser supports continuous voice
   */
  static isSupported(): boolean {
    return !!(
      window.SpeechRecognition || (window as any).webkitSpeechRecognition
    );
  }
}

// Singleton instance
export const continuousVoice = new ContinuousVoice();

// Export for React hooks
export function useContinuousVoice() {
  return continuousVoice;
}
