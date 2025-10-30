// Fix: Implement the LivePanel component for real-time audio conversation.
import React, { useState, useRef, useEffect, useCallback } from 'react';
import '../src/sa21-chat.css';
import { connectLiveConversation } from '../services/geminiService';
import { LiveServerMessage, LiveSession } from '@google/genai';
import { encode, decode, decodeAudioData } from '../utils/audio';
import { MicIcon } from './icons/MicIcon';
import { SpeakerIcon } from './icons/SpeakerIcon';

interface TranscriptionTurn {
  id: number;
  userInput: string;
  modelOutput: string;
}

const LivePanel: React.FC = () => {
  const [isLive, setIsLive] = useState(false);
  const [error, setError] = useState('');
  const [transcriptionHistory, setTranscriptionHistory] = useState<TranscriptionTurn[]>([]);

  const currentInputRef = useRef('');
  const currentOutputRef = useRef('');

  const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);

  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  const nextAudioStartTimeRef = useRef(0);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const stopConversationResources = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }
    if (mediaStreamSourceRef.current) {
      mediaStreamSourceRef.current.disconnect();
      mediaStreamSourceRef.current = null;
    }
    if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
      inputAudioContextRef.current.close().catch(console.error);
      inputAudioContextRef.current = null;
    }
    if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
      outputAudioContextRef.current.close().catch(console.error);
      outputAudioContextRef.current = null;
    }
    if (sessionPromiseRef.current) {
      sessionPromiseRef.current.then((session) => session.close()).catch(console.error);
      sessionPromiseRef.current = null;
    }
    audioSourcesRef.current.forEach((source) => source.stop());
    audioSourcesRef.current.clear();
    nextAudioStartTimeRef.current = 0;
  }, []);

  const startConversation = async () => {
    setError('');
    setTranscriptionHistory([]);
    currentInputRef.current = '';
    currentOutputRef.current = '';
    setIsLive(true);
    try {
      mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      sessionPromiseRef.current = connectLiveConversation({
        onopen: () => console.log('Live connection opened.'),
        onclose: () => console.log('Live connection closed.'),
        onerror: (e) => {
          console.error('Live connection error:', e);
          setError('Connection error. Please try again.');
          stopConversation();
        },
        onmessage: async (message: LiveServerMessage) => {
          if (message.serverContent?.inputTranscription) {
            currentInputRef.current += message.serverContent.inputTranscription.text;
          }
          if (message.serverContent?.outputTranscription) {
            currentOutputRef.current += message.serverContent.outputTranscription.text;
          }
          if (message.serverContent?.turnComplete) {
            const fullInput = currentInputRef.current;
            const fullOutput = currentOutputRef.current;
            if (fullInput.trim() || fullOutput.trim()) {
              setTranscriptionHistory((prev) => [
                ...prev,
                { id: Date.now(), userInput: fullInput, modelOutput: fullOutput },
              ]);
            }
            currentInputRef.current = '';
            currentOutputRef.current = '';
          }

          const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          if (base64Audio && outputAudioContextRef.current) {
            const outputCtx = outputAudioContextRef.current;
            nextAudioStartTimeRef.current = Math.max(
              nextAudioStartTimeRef.current,
              outputCtx.currentTime
            );
            const audioBuffer = await decodeAudioData(
              decode(base64Audio),
              outputCtx,
              24000,
              1
            );
            const source = outputCtx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(outputCtx.destination);
            source.addEventListener('ended', () => audioSourcesRef.current.delete(source));
            source.start(nextAudioStartTimeRef.current);
            nextAudioStartTimeRef.current += audioBuffer.duration;
            audioSourcesRef.current.add(source);
          }
        },
      });

      mediaStreamSourceRef.current = inputAudioContextRef.current.createMediaStreamSource(mediaStreamRef.current);
      scriptProcessorRef.current = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);

      scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
        const l = inputData.length;
        const int16 = new Int16Array(l);
        for (let i = 0; i < l; i++) {
          int16[i] = inputData[i] * 32768;
        }
        const base64 = encode(new Uint8Array(int16.buffer));

        sessionPromiseRef.current
          ?.then((session) => {
            session.sendRealtimeInput({ media: { data: base64, mimeType: 'audio/pcm;rate=16000' } });
          })
          .catch((e) => {
            console.error('Error sending audio data:', e);
          });
      };

      mediaStreamSourceRef.current.connect(scriptProcessorRef.current);
      scriptProcessorRef.current.connect(inputAudioContextRef.current.destination);
    } catch (err) {
      console.error('Error starting conversation:', err);
      setError('Could not start live conversation. Please ensure microphone access is granted.');
      setIsLive(false);
      stopConversationResources();
    }
  };

  const stopConversation = useCallback(() => {
    setIsLive(false);
    stopConversationResources();
  }, [stopConversationResources]);

  useEffect(() => {
    return () => stopConversationResources();
  }, [stopConversationResources]);

  return (
    <div className="sa21-root">
      <div className="sa21-header" style={{ position: 'relative' }}>
        <div className="sa21-logo-row">
          <div className="sa21-logo">ROOF ER</div>
          <div className="sa21-title">S21 FIELD // Live</div>
        </div>
        <div className="sa21-actions-bar">
          <a className="sa21-topbtn" href="#chat">Chat</a>
          <a className="sa21-topbtn" href="#image">Image</a>
          <a className="sa21-topbtn" href="#email">Email</a>
        </div>
      </div>
      <div className="sa21-main">
        <aside className="sa21-quick">
          <h3>Quick Actions</h3>
          <button className="qa-btn" onClick={() => !isLive && startConversation()}>Start Live</button>
          <button className="qa-btn" onClick={() => isLive && stopConversation()}>Stop</button>
        </aside>
        <section className="sa21-chat">
          <div className="sa21-chat-header">Live Conversation</div>
          <div className="sa21-page-body">
        <div className="rounded-lg p-4 flex-1 overflow-y-auto border border-white/15 bg-white/5">
          {transcriptionHistory.length === 0 && !isLive && (
            <p className="text-white/60">Conversation transcript will appear here...</p>
          )}
          <div className="space-y-4">
            {transcriptionHistory.map((turn) => (
              <div key={turn.id}>
                <p className="text-white/70 font-semibold">You:</p>
                <p className="text-white/90 ml-4">{turn.userInput}</p>
                <p className="text-[var(--s21-secondary)] font-semibold mt-2">S21:</p>
                <p className="text-white/90 ml-4">{turn.modelOutput}</p>
              </div>
            ))}
          </div>
        </div>
          </div>
          <div className="flex flex-col items-center space-y-4 pt-4">
        {error && <p className="text-red-400">{error}</p>}
        {!isLive ? (
          <button
            onClick={startConversation}
            className="sa21-btn send px-6 py-3 rounded-full flex items-center space-x-2 text-lg font-semibold"
          >
            <MicIcon className="h-6 w-6" />
            <span>Start Conversation</span>
          </button>
        ) : (
          <div className="flex items-center space-x-4">
            <button
              onClick={stopConversation}
              className="sa21-topbtn px-6 py-3 rounded-full flex items-center space-x-2 text-lg font-semibold"
            >
              <div className="h-6 w-6 flex items-center justify-center">
                <div className="h-3 w-3 bg-white rounded-sm"></div>
              </div>
              <span>Stop</span>
            </button>
            <div className="flex items-center space-x-2 text-green-400 animate-pulse">
              <SpeakerIcon className="h-6 w-6" />
              <span>LIVE</span>
            </div>
          </div>
        )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default LivePanel;
