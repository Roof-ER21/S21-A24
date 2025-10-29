import React, { useState, useEffect, useRef, useCallback } from 'react';
import '../src/sa21-chat.css';
import { motion, AnimatePresence } from 'framer-motion';
import { connectTranscriptionStream } from '../services/geminiService';
import { LiveSession, LiveServerMessage } from '@google/genai';
import { Message } from '../types';
import Spinner from './Spinner';
import TypingIndicator from './TypingIndicator';
import MessageBubble from './MessageBubble';
import WelcomeScreen from './WelcomeScreen';
import { MicIcon } from './icons/MicIcon';
import { encode } from '../utils/audio';
import { ragService } from '../services/ragService';
import { multiAI, AIProvider } from '../services/multiProviderAI';
import { MessageSquare, Mic, Sparkles, Zap, Send, Activity, MapPin, GraduationCap } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { personalityHelpers, SYSTEM_PROMPT, CONTEXTUAL_RESPONSES } from '../config/s21Personality';
import StateSelector from './StateSelector';
import RoleplayModal from './RoleplayModal';

const ChatPanel: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const [currentProvider, setCurrentProvider] = useState<string>('Auto');
  const [availableProviders, setAvailableProviders] = useState<AIProvider[]>([]);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showStateSelector, setShowStateSelector] = useState(false);
  const [showRoleplayModal, setShowRoleplayModal] = useState(false);
  const [showAppMenu, setShowAppMenu] = useState(false);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const appMenuRef = useRef<HTMLDivElement | null>(null);

  // Refs for voice transcription
  const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  // Effect to initialize and load messages from localStorage
  useEffect(() => {
    // Check available providers
    multiAI.getAvailableProviders().then(providers => {
      setAvailableProviders(providers);
      console.log('Available AI providers:', providers.length);
    });

    try {
      const savedMessages = localStorage.getItem('chatHistory');

      if (savedMessages) {
        const parsedMessages: Message[] = JSON.parse(savedMessages);
        if (parsedMessages.length > 0) {
          // Has chat history - returning user, hide welcome
          setMessages(parsedMessages);
          setShowWelcome(false);
        } else {
          // Empty history - show welcome
          const welcomeMessage = personalityHelpers.getWelcomeMessage(false);
          setMessages([{
            id: 'initial',
            text: welcomeMessage.text,
            sender: 'bot'
          }]);
          setShowWelcome(true);
        }
      } else {
        // No history at all - show welcome
        const welcomeMessage = personalityHelpers.getWelcomeMessage(false);
        setMessages([{
          id: 'initial',
          text: welcomeMessage.text,
          sender: 'bot'
        }]);
        setShowWelcome(true);
      }
    } catch (error) {
      console.error("Failed to load chat history:", error);
      const welcomeMessage = personalityHelpers.getWelcomeMessage(false);
      setMessages([{
        id: 'initial',
        text: welcomeMessage.text,
        sender: 'bot'
      }]);
      setShowWelcome(true);
    }
  }, []);

  // Effect to save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chatHistory', JSON.stringify(messages));
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  // close app menu on outside click / Esc
  useEffect(() => {
    if (!showAppMenu) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setShowAppMenu(false);
    const onDown = (e: Event) => {
      const t = e.target as Node;
      if (appMenuRef.current && !appMenuRef.current.contains(t)) setShowAppMenu(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDown as EventListener);
    document.addEventListener('touchstart', onDown as EventListener, { passive: true });
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onDown as EventListener);
      document.removeEventListener('touchstart', onDown as EventListener);
    };
  }, [showAppMenu]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    // Hide welcome screen on first message
    if (showWelcome) {
      setShowWelcome(false);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: userInput,
      sender: 'user',
    };
    setMessages(prev => [...prev, userMessage]);
    const originalQuery = userInput;
    setUserInput('');
    setIsLoading(true);

    try {
      // Detect query type for contextual response
      const queryType = personalityHelpers.detectQueryType(originalQuery);

      // Check if query should use RAG
      const useRAG = ragService.shouldUseRAG(originalQuery);
      let systemPrompt = SYSTEM_PROMPT;
      let userPrompt = originalQuery;
      let sources: any[] = [];

      if (useRAG) {
        console.log('[RAG] Enhancing query with knowledge base...');
        const ragContext = await ragService.buildRAGContext(originalQuery, 3);
        systemPrompt = ragContext.enhancedPrompt.split('USER QUESTION:')[0];
        userPrompt = originalQuery;
        sources = ragContext.sources;
        console.log(`[RAG] Found ${sources.length} relevant documents`);
      }

      // Build conversation history
      const conversationMessages = [
        { role: 'system' as const, content: systemPrompt },
        ...messages
          .filter(m => m.sender !== 'bot' || !m.text.includes('Hey there!') && !m.text.includes('Welcome back') && !m.text.includes('Good morning') && !m.text.includes('Good afternoon'))
          .slice(-10) // Keep last 10 messages for context
          .map(m => ({
            role: m.sender === 'user' ? ('user' as const) : ('assistant' as const),
            content: m.text,
          })),
        { role: 'user' as const, content: userPrompt },
      ];

      // Send to multi-provider AI
      const response = await multiAI.generate(conversationMessages);

      // Update current provider info
      setCurrentProvider(response.provider);

      // Add source citations if RAG was used
      let responseText = response.content;
      if (useRAG && sources.length > 0) {
        responseText += ragService.formatSourcesCitation(sources);
      }

      // Add provider badge to response
      responseText += `\n\n_🤖 Powered by ${response.provider}_`;

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: 'bot',
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `Sorry, I encountered an error: ${(error as Error).message}\n\nPlease check your API keys in .env.local or install Ollama for local AI.`,
        sender: 'bot',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Voice Input Logic ---

  const stopVoiceInputResources = useCallback(() => {
    if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
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
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(console.error);
        audioContextRef.current = null;
    }
    if(sessionPromiseRef.current) {
        sessionPromiseRef.current.then(session => session.close()).catch(console.error);
        sessionPromiseRef.current = null;
    }
  }, []);

  const stopVoiceInput = useCallback(() => {
    setIsVoiceRecording(false);
    stopVoiceInputResources();
  }, [stopVoiceInputResources]);

  const startVoiceInput = async () => {
    setVoiceError('');
    if (isVoiceRecording) return;

    setIsVoiceRecording(true);
    try {
      mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });

      sessionPromiseRef.current = connectTranscriptionStream({
        onopen: () => console.log("Voice input connection opened."),
        onclose: () => console.log("Voice input connection closed."),
        onerror: (e) => {
          console.error("Voice input error:", e);
          setVoiceError("Connection error.");
          stopVoiceInput();
        },
        onmessage: (message: LiveServerMessage) => {
          if (message.serverContent?.inputTranscription) {
            setUserInput(prev => prev + message.serverContent.inputTranscription.text);
          }
        },
      });

      mediaStreamSourceRef.current = audioContextRef.current.createMediaStreamSource(mediaStreamRef.current);
      scriptProcessorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);

      scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
        const l = inputData.length;
        const int16 = new Int16Array(l);
        for (let i = 0; i < l; i++) {
          int16[i] = inputData[i] * 32768;
        }
        const base64 = encode(new Uint8Array(int16.buffer));

        sessionPromiseRef.current?.then(session => {
           session.sendRealtimeInput({ media: { data: base64, mimeType: 'audio/pcm;rate=16000' } });
        }).catch(e => {
            console.error("Error sending audio data:", e);
        });
      };

      mediaStreamSourceRef.current.connect(scriptProcessorRef.current);
      scriptProcessorRef.current.connect(audioContextRef.current.destination);

    } catch (err) {
      console.error("Error starting voice input:", err);
      setVoiceError("Mic access denied.");
      setIsVoiceRecording(false);
      stopVoiceInputResources();
    }
  };

  const handleToggleVoiceRecording = () => {
    if (isVoiceRecording) {
      stopVoiceInput();
    } else {
      startVoiceInput();
    }
  };

  useEffect(() => {
    return () => {
      stopVoiceInputResources();
    };
  }, [stopVoiceInputResources]);

  const handleWelcomeGetStarted = () => {
    setShowWelcome(false);
  };

  return (
    <div className="sa21-root">
      {/* Header */}
      <div className="sa21-header" style={{ position: 'relative' }}>
        <div className="sa21-logo-row">
          <div className="sa21-logo">ROOF ER</div>
          <div className="sa21-title">S21 FIELD // Assistant</div>
        </div>
        <div className="sa21-actions-bar">
          <div className="sa21-status" title="Systems active"><span className="sa21-status-dot"/> Online</div>
          <button className="sa21-topbtn" onClick={() => setShowStateSelector(!showStateSelector)}>State</button>
          <button className="sa21-topbtn" onClick={() => setShowRoleplayModal(true)}>Train</button>
          <button className="sa21-topbtn" onClick={() => setShowAppMenu(v => !v)}>Apps ▾</button>
        </div>
        {showAppMenu && (
          <div className="sa21-app-menu" ref={appMenuRef as any}>
            {[
              { id: 'chat', label: 'Chat' },
              { id: 'image', label: 'Image Analysis' },
              { id: 'transcribe', label: 'Transcription' },
              { id: 'email', label: 'Email' },
              { id: 'maps', label: 'Maps' },
              { id: 'live', label: 'Live' },
              { id: 'knowledge', label: 'Knowledge Base' },
            ].map(it => (
              <div key={it.id} className="item" onClick={() => { window.location.hash = `#${it.id}`; setShowAppMenu(false); }}>
                {it.label}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main */}
      <div className="sa21-main">
        {/* Quick Actions */}
        <aside className="sa21-quick">
          <h3>Quick Actions</h3>
          <button className="qa-btn" onClick={() => setUserInput('Summarize this inspection note for the homeowner.')}>
            Summarize note
          </button>
          <button className="qa-btn" onClick={() => setUserInput('Draft an email to the adjuster requesting additional photos of the roof valley.')}>Email adjuster</button>
          <button className="qa-btn" onClick={() => setUserInput('What are GAF Timberline HDZ shingle specs?')}>GAF HDZ specs</button>
          <button className="qa-btn" onClick={() => setUserInput('Write a script for a door-to-door introduction after a hailstorm.')}>Sales script</button>
        </aside>

        {/* Chat Column */}
        <section className="sa21-chat">
          <div className="sa21-chat-header">Chat</div>

          {/* Conversation */}
          <div className="sa21-convo" id="conversation">
            <div className="sa21-convo-bottom">
              {messages.length === 0 ? (
                <div style={{display:'grid', placeItems:'center', minHeight:'50vh'}}>
                  <div style={{textAlign:'center', maxWidth:700}}>
                    <div style={{fontSize:24, fontWeight:800, color:'#fff', marginBottom:12}}>
                      Hey there! I'm S21, your AI‑powered roofing expert.
                    </div>
                    <div style={{color:'#bfbfbf', lineHeight:1.6, marginBottom:24}}>
                      I’ve got instant access to 123+ industry documents and I’m running on 4 different AI systems working together to give you the best answers. Whether it’s GAF product specs, sales scripts, or handling tough customer questions — I’ve got your back.
                    </div>
                    <div style={{display:'flex', gap:32, justifyContent:'center', color:'#e5e5e5', marginBottom:28}}>
                      <div><div style={{fontSize:28, fontWeight:900, color:'#c41e3a'}}>123+</div><div style={{fontSize:10, letterSpacing:2, opacity:.8}}>DOCUMENTS</div></div>
                      <div><div style={{fontSize:28, fontWeight:900, color:'#c41e3a'}}>4</div><div style={{fontSize:10, letterSpacing:2, opacity:.8}}>AI SYSTEMS</div></div>
                      <div><div style={{fontSize:28, fontWeight:900, color:'#c41e3a'}}>24/7</div><div style={{fontSize:10, letterSpacing:2, opacity:.8}}>AVAILABLE</div></div>
                    </div>
                    <div style={{display:'flex', flexWrap:'wrap', gap:8, justifyContent:'center'}}>
                      {['GAF Specs','Price Objection','VA Claim Docs','Measurements','Safety','Warranties'].map((t)=> (
                        <button key={t} className="sa21-topbtn" onClick={()=>setUserInput(t)}>{t}</button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
              <div className="sa21-msg">
                <div className="avatar">S21</div>
                <div>
                  <div className="bubble">
                    Hey there! I'm S21, your AI-powered roofing expert. I've got instant access to 123+ industry documents and I'm running on 4 different AI systems working together to give you the best answers. Whether it's GAF product specs, sales scripts, or handling tough customer questions – I've got your back. What can I help with today?
                  </div>
                  <div className="sa21-time">{new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                </div>
              </div>
              )}
              {messages.map((msg, index) => (
                <div key={msg.id} className={`sa21-msg ${msg.sender === 'user' ? 'user' : ''}`}>
                  {msg.sender !== 'user' && <div className="avatar">S21</div>}
                  <div>
                    <div className="bubble">{msg.text}</div>
                    <div className="sa21-time">{new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                  </div>
                  {msg.sender === 'user' && <div className="avatar">YOU</div>}
                </div>
              ))}
              {isLoading && (
                <div className="sa21-msg">
                  <div className="avatar">S21</div>
                  <div className="bubble">Thinking…</div>
                </div>
              )}
            </div>
          </div>

          {/* Composer */}
          <div className="sa21-footer">
            <form onSubmit={handleSendMessage}>
              <div className="sa21-input">
                <textarea
                  ref={el => { if (el) el.style.height = 'auto'; }}
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e as any); } }}
                  placeholder="Ask me anything about roofing, sales, products, or field work..."
                  rows={1}
                />
                <div className="sa21-actions">
                  <button type="button" className="sa21-btn" title="Voice" onClick={handleToggleVoiceRecording}>🎤</button>
                  <button type="submit" className="sa21-btn send" disabled={!userInput.trim() || isLoading}>➤</button>
                </div>
              </div>
            </form>
          </div>
        </section>
      </div>

      {/* Roleplay Modal */}
      <RoleplayModal
        isOpen={showRoleplayModal}
        onClose={() => setShowRoleplayModal(false)}
        onAIRequest={async (message: string, systemPrompt: string) => {
          // Use multiAI to generate response with Agnes persona
          const conversationMessages = [
            { role: 'system' as const, content: systemPrompt },
            { role: 'user' as const, content: message },
          ];
          const response = await multiAI.generate(conversationMessages);
          return response.content;
        }}
      />
    </div>
  );
};

export default ChatPanel;
