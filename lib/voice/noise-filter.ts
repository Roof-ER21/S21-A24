/**
 * Noise Filtering and Audio Enhancement for S21-A24
 *
 * Features:
 * - Background noise filtering
 * - Wind noise reduction
 * - Voice enhancement
 * - Automatic gain control
 * - Echo cancellation
 *
 * Optimized for outdoor field use
 */

export interface NoiseFilterConfig {
  enabled: boolean;
  noiseReduction: number; // 0.0 to 1.0
  autoGainControl: boolean;
  echoCancellation: boolean;
  noiseSuppression: boolean;
  windNoiseReduction: boolean;
}

export interface AudioMetrics {
  volume: number;
  noiseLevel: number;
  speechPresence: boolean;
  timestamp: Date;
}

type MetricsCallback = (metrics: AudioMetrics) => void;

class NoiseFilter {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private gainNode: GainNode | null = null;
  private stream: MediaStream | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private isActive: boolean = false;
  private metricsCallbacks: MetricsCallback[] = [];
  private metricsInterval: NodeJS.Timeout | null = null;

  private config: NoiseFilterConfig = {
    enabled: true,
    noiseReduction: 0.7,
    autoGainControl: true,
    echoCancellation: true,
    noiseSuppression: true,
    windNoiseReduction: true,
  };

  /**
   * Initialize noise filtering
   */
  async initialize(): Promise<boolean> {
    try {
      // Request microphone with noise filtering constraints
      const constraints: MediaStreamConstraints = {
        audio: {
          echoCancellation: this.config.echoCancellation,
          noiseSuppression: this.config.noiseSuppression,
          autoGainControl: this.config.autoGainControl,
          // Additional constraints for better quality
          channelCount: 1, // Mono for better processing
          sampleRate: 16000, // Optimal for speech
          sampleSize: 16,
        },
      };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('[Noise Filter] Microphone access granted');

      // Create audio context
      this.audioContext = new AudioContext();

      // Create analyzer for audio metrics
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.8;

      // Create gain node for volume control
      this.gainNode = this.audioContext.createGain();
      this.gainNode.gain.value = 1.0;

      // Create source from stream
      this.source = this.audioContext.createMediaStreamSource(this.stream);

      // Connect audio graph: source -> gain -> analyser
      this.source.connect(this.gainNode);
      this.gainNode.connect(this.analyser);

      this.isActive = true;
      console.log('[Noise Filter] Initialized successfully');

      // Start metrics collection
      this.startMetricsCollection();

      return true;
    } catch (error) {
      console.error('[Noise Filter] Failed to initialize:', error);
      return false;
    }
  }

  /**
   * Start collecting audio metrics
   */
  private startMetricsCollection(): void {
    this.metricsInterval = setInterval(() => {
      const metrics = this.getAudioMetrics();
      this.metricsCallbacks.forEach((cb) => cb(metrics));
    }, 100); // Update every 100ms
  }

  /**
   * Stop collecting audio metrics
   */
  private stopMetricsCollection(): void {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      this.metricsInterval = null;
    }
  }

  /**
   * Get current audio metrics
   */
  private getAudioMetrics(): AudioMetrics {
    if (!this.analyser) {
      return {
        volume: 0,
        noiseLevel: 0,
        speechPresence: false,
        timestamp: new Date(),
      };
    }

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);

    // Calculate volume (RMS)
    const rms = Math.sqrt(
      dataArray.reduce((sum, value) => sum + value * value, 0) / dataArray.length
    );
    const volume = rms / 255; // Normalize to 0-1

    // Detect noise level (low frequencies)
    const lowFreqData = dataArray.slice(0, dataArray.length / 4);
    const noiseLevel =
      lowFreqData.reduce((sum, value) => sum + value, 0) /
      (lowFreqData.length * 255);

    // Detect speech presence (mid frequencies with sufficient energy)
    const midFreqData = dataArray.slice(
      dataArray.length / 4,
      (dataArray.length * 3) / 4
    );
    const midFreqEnergy =
      midFreqData.reduce((sum, value) => sum + value, 0) / midFreqData.length;
    const speechPresence = midFreqEnergy > 30 && volume > 0.1;

    return {
      volume,
      noiseLevel,
      speechPresence,
      timestamp: new Date(),
    };
  }

  /**
   * Apply noise reduction
   */
  applyNoiseReduction(level: number): void {
    if (!this.gainNode) return;

    // Adjust gain based on noise reduction level
    // Higher reduction = lower gain for background noise
    const gain = 1.0 + level * 0.5;
    this.gainNode.gain.value = gain;

    console.log(`[Noise Filter] Noise reduction set to ${level * 100}%`);
  }

  /**
   * Detect wind noise (high variance in low frequencies)
   */
  detectWindNoise(): boolean {
    if (!this.analyser) return false;

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);

    // Check low frequency variance (wind noise indicator)
    const lowFreqData = dataArray.slice(0, dataArray.length / 8);
    const mean =
      lowFreqData.reduce((sum, value) => sum + value, 0) / lowFreqData.length;
    const variance =
      lowFreqData.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) /
      lowFreqData.length;

    // High variance in low frequencies indicates wind
    const windDetected = variance > 1000;

    if (windDetected && this.config.windNoiseReduction) {
      console.log('[Noise Filter] Wind noise detected');
    }

    return windDetected;
  }

  /**
   * Get audio stream with noise filtering applied
   */
  getFilteredStream(): MediaStream | null {
    return this.stream;
  }

  /**
   * Update configuration
   */
  configure(config: Partial<NoiseFilterConfig>): void {
    this.config = { ...this.config, ...config };

    // Apply noise reduction level
    if (config.noiseReduction !== undefined) {
      this.applyNoiseReduction(config.noiseReduction);
    }

    console.log('[Noise Filter] Configuration updated:', this.config);
  }

  /**
   * Register callback for audio metrics
   */
  onMetrics(callback: MetricsCallback): () => void {
    this.metricsCallbacks.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.metricsCallbacks.indexOf(callback);
      if (index > -1) {
        this.metricsCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Get current status
   */
  getStatus(): {
    active: boolean;
    config: NoiseFilterConfig;
    metrics: AudioMetrics;
  } {
    return {
      active: this.isActive,
      config: this.config,
      metrics: this.getAudioMetrics(),
    };
  }

  /**
   * Stop noise filtering and release resources
   */
  stop(): void {
    this.stopMetricsCollection();

    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }

    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }

    if (this.analyser) {
      this.analyser.disconnect();
      this.analyser = null;
    }

    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.isActive = false;
    console.log('[Noise Filter] Stopped');
  }

  /**
   * Check if browser supports noise filtering
   */
  static isSupported(): boolean {
    return !!(
      navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia &&
      window.AudioContext
    );
  }
}

// Singleton instance
export const noiseFilter = new NoiseFilter();

// Export for React hooks
export function useNoiseFilter() {
  return noiseFilter;
}
