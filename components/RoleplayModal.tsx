'use client';

import { useState, useEffect } from 'react';
import { X, Play, RotateCcw, CheckCircle, Circle, Trophy, MessageSquare } from 'lucide-react';
import {
  RoleplayScenario,
  getScenarioById,
  allRoleplayScenarios,
  calculateScenarioScore,
  generateScoreFeedback,
  getDifficultyEmoji,
  getCharacterEmoji,
  DifficultyLevel,
} from '@/lib/training/roleplay-engine';
import { getAgnesSystemPrompt } from '@/lib/personas/agnes-24';

interface RoleplayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAIRequest: (message: string, systemPrompt: string) => Promise<string>;
}

type RoleplayPhase = 'selection' | 'briefing' | 'active' | 'feedback';

interface Exchange {
  repMessage: string;
  characterResponse: string;
  timestamp: Date;
}

export default function RoleplayModal({ isOpen, onClose, onAIRequest }: RoleplayModalProps) {
  const [phase, setPhase] = useState<RoleplayPhase>('selection');
  const [selectedScenario, setSelectedScenario] = useState<RoleplayScenario | null>(null);
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [criteriaChecked, setCriteriaChecked] = useState<boolean[]>([]);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [filterDifficulty, setFilterDifficulty] = useState<DifficultyLevel | 'all'>('all');

  useEffect(() => {
    if (!isOpen) {
      resetRoleplay();
    }
  }, [isOpen]);

  const resetRoleplay = () => {
    setPhase('selection');
    setSelectedScenario(null);
    setExchanges([]);
    setCurrentInput('');
    setCriteriaChecked([]);
    setFinalScore(null);
    setFeedback(null);
  };

  const startScenario = (scenario: RoleplayScenario) => {
    setSelectedScenario(scenario);
    setCriteriaChecked(new Array(scenario.successCriteria.length).fill(false));
    setPhase('briefing');
  };

  const beginRoleplay = () => {
    if (!selectedScenario) return;
    setPhase('active');
    // Add character's opening line
    setExchanges([
      {
        repMessage: '',
        characterResponse: selectedScenario.openingLine,
        timestamp: new Date(),
      },
    ]);
  };

  const handleSendMessage = async () => {
    if (!currentInput.trim() || !selectedScenario || isProcessing) return;

    setIsProcessing(true);

    const newExchange: Exchange = {
      repMessage: currentInput,
      characterResponse: '',
      timestamp: new Date(),
    };

    // Update exchanges with rep's message
    setExchanges((prev) => [...prev, { ...newExchange }]);

    try {
      // Build conversation history for context
      const conversationHistory = exchanges
        .map((ex) => {
          const parts = [];
          if (ex.repMessage) parts.push(`Rep: ${ex.repMessage}`);
          if (ex.characterResponse) parts.push(`${selectedScenario.characterName}: ${ex.characterResponse}`);
          return parts.join('\n');
        })
        .join('\n\n');

      // Create roleplay prompt
      const roleplayPrompt = `${getAgnesSystemPrompt('roleplay')}

CURRENT SCENARIO: ${selectedScenario.title}
CHARACTER: ${selectedScenario.characterName} (${selectedScenario.character})
CHARACTER BACKGROUND: ${selectedScenario.characterBackground}

SCENARIO OBJECTIVE: ${selectedScenario.objective}

CONVERSATION SO FAR:
${conversationHistory}

Rep's latest message: ${currentInput}

RESPOND AS ${selectedScenario.characterName.toUpperCase()}. Stay in character. React naturally to what the rep just said. Use the response patterns as guidance, but adapt to the actual conversation. Keep responses realistic and conversational (2-4 sentences).`;

      const characterResponse = await onAIRequest(currentInput, roleplayPrompt);

      // Update the last exchange with character's response
      setExchanges((prev) => {
        const updated = [...prev];
        updated[updated.length - 1].characterResponse = characterResponse;
        return updated;
      });
    } catch (error) {
      console.error('Roleplay error:', error);
      setExchanges((prev) => {
        const updated = [...prev];
        updated[updated.length - 1].characterResponse =
          "I'm sorry, there was an error. Please try again.";
        return updated;
      });
    } finally {
      setIsProcessing(false);
      setCurrentInput('');
    }
  };

  const toggleCriteria = (index: number) => {
    setCriteriaChecked((prev) => {
      const updated = [...prev];
      updated[index] = !updated[index];
      return updated;
    });
  };

  const endRoleplay = async () => {
    if (!selectedScenario) return;

    setIsProcessing(true);

    const criteriaMet = criteriaChecked.filter(Boolean).length;
    const score = calculateScenarioScore(selectedScenario, criteriaMet);
    setFinalScore(score);

    // Generate AI feedback
    try {
      const conversationHistory = exchanges
        .map((ex, idx) => {
          const parts = [];
          if (ex.repMessage) parts.push(`Rep: ${ex.repMessage}`);
          if (ex.characterResponse) parts.push(`${selectedScenario.characterName}: ${ex.characterResponse}`);
          return parts.join('\n');
        })
        .join('\n\n');

      const feedbackPrompt = `${getAgnesSystemPrompt('roleplay')}

The rep just completed a roleplay scenario. Provide feedback.

SCENARIO: ${selectedScenario.title}
OBJECTIVE: ${selectedScenario.objective}

SUCCESS CRITERIA:
${selectedScenario.successCriteria.map((c, i) => `${i + 1}. ${c} ${criteriaChecked[i] ? '✓' : '✗'}`).join('\n')}

SCORE: ${score}/100 (${criteriaMet}/${selectedScenario.successCriteria.length} criteria met)

CONVERSATION:
${conversationHistory}

COMMON MISTAKES TO WATCH FOR:
${selectedScenario.commonMistakes.join('\n- ')}

COACHING TIPS:
${selectedScenario.coachingTips.join('\n- ')}

Provide feedback following the ROLEPLAY FEEDBACK STRUCTURE from your system prompt. Be specific, encouraging, and actionable.`;

      const aiFeedback = await onAIRequest('Please provide feedback on my roleplay performance', feedbackPrompt);
      setFeedback(aiFeedback);
    } catch (error) {
      console.error('Feedback error:', error);
      setFeedback(generateScoreFeedback(score));
    } finally {
      setIsProcessing(false);
      setPhase('feedback');
    }
  };

  const filteredScenarios =
    filterDifficulty === 'all'
      ? allRoleplayScenarios
      : allRoleplayScenarios.filter((s) => s.difficulty === filterDifficulty);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-purple-500/30">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              🎭
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Roleplay Training</h2>
              <p className="text-white/80 text-sm">Practice with Agnes 24</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* SELECTION PHASE */}
          {phase === 'selection' && (
            <div className="space-y-6">
              {/* Filter */}
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterDifficulty('all')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filterDifficulty === 'all'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  All Scenarios
                </button>
                <button
                  onClick={() => setFilterDifficulty('beginner')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filterDifficulty === 'beginner'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  🟢 Beginner
                </button>
                <button
                  onClick={() => setFilterDifficulty('intermediate')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filterDifficulty === 'intermediate'
                      ? 'bg-yellow-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  🟡 Intermediate
                </button>
                <button
                  onClick={() => setFilterDifficulty('advanced')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filterDifficulty === 'advanced'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  🔴 Advanced
                </button>
              </div>

              {/* Scenarios Grid */}
              <div className="grid gap-4">
                {filteredScenarios.map((scenario) => (
                  <div
                    key={scenario.id}
                    className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 hover:border-purple-500/50 transition-colors cursor-pointer"
                    onClick={() => startScenario(scenario)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getDifficultyEmoji(scenario.difficulty)}</span>
                        <span className="text-2xl">{getCharacterEmoji(scenario.character)}</span>
                        <div>
                          <h3 className="text-white font-semibold">{scenario.title}</h3>
                          <p className="text-gray-400 text-sm">
                            {scenario.characterName} • {scenario.estimatedDuration} min
                          </p>
                        </div>
                      </div>
                      <Play className="w-5 h-5 text-purple-400" />
                    </div>
                    <p className="text-gray-300 text-sm mb-2">{scenario.objective}</p>
                    <p className="text-gray-500 text-xs italic">{scenario.characterBackground}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BRIEFING PHASE */}
          {phase === 'briefing' && selectedScenario && (
            <div className="space-y-6">
              <div className="bg-purple-900/30 border border-purple-500/30 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{getDifficultyEmoji(selectedScenario.difficulty)}</span>
                  <div>
                    <h3 className="text-xl font-bold text-white">{selectedScenario.title}</h3>
                    <p className="text-purple-300">
                      {selectedScenario.characterName} • {selectedScenario.difficulty}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-purple-300 mb-1">Character Background</h4>
                    <p className="text-gray-300">{selectedScenario.characterBackground}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-purple-300 mb-1">Your Objective</h4>
                    <p className="text-gray-300">{selectedScenario.objective}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-purple-300 mb-2">Success Criteria</h4>
                    <ul className="space-y-2">
                      {selectedScenario.successCriteria.map((criteria, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-gray-300">
                          <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{criteria}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-purple-300 mb-2">Coaching Tips</h4>
                    <ul className="space-y-1">
                      {selectedScenario.coachingTips.map((tip, idx) => (
                        <li key={idx} className="text-gray-400 text-sm">
                          • {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setPhase('selection')}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  Choose Different Scenario
                </button>
                <button
                  onClick={beginRoleplay}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  Start Roleplay
                </button>
              </div>
            </div>
          )}

          {/* ACTIVE PHASE */}
          {phase === 'active' && selectedScenario && (
            <div className="space-y-4">
              {/* Success Criteria Tracker */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-purple-300 mb-3">
                  Track Your Progress ({criteriaChecked.filter(Boolean).length}/{selectedScenario.successCriteria.length})
                </h4>
                <div className="space-y-2">
                  {selectedScenario.successCriteria.map((criteria, idx) => (
                    <div
                      key={idx}
                      onClick={() => toggleCriteria(idx)}
                      className="flex items-start gap-2 cursor-pointer hover:bg-gray-700/30 p-2 rounded-lg transition-colors"
                    >
                      {criteriaChecked[idx] ? (
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-500 flex-shrink-0" />
                      )}
                      <span className={`text-sm ${criteriaChecked[idx] ? 'text-green-300' : 'text-gray-400'}`}>
                        {criteria}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Conversation */}
              <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-4 max-h-[300px] overflow-y-auto space-y-4">
                {exchanges.map((exchange, idx) => (
                  <div key={idx} className="space-y-3">
                    {exchange.characterResponse && (
                      <div className="flex gap-3">
                        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                          {getCharacterEmoji(selectedScenario.character)}
                        </div>
                        <div className="flex-1 bg-purple-900/30 rounded-lg p-3">
                          <p className="text-xs font-medium text-purple-300 mb-1">
                            {selectedScenario.characterName}
                          </p>
                          <p className="text-gray-200">{exchange.characterResponse}</p>
                        </div>
                      </div>
                    )}
                    {exchange.repMessage && (
                      <div className="flex gap-3 justify-end">
                        <div className="flex-1 bg-blue-900/30 rounded-lg p-3 max-w-[80%]">
                          <p className="text-xs font-medium text-blue-300 mb-1">You</p>
                          <p className="text-gray-200">{exchange.repMessage}</p>
                        </div>
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                          👤
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="space-y-3">
                <textarea
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type your response..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none resize-none"
                  rows={3}
                  disabled={isProcessing}
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleSendMessage}
                    disabled={!currentInput.trim() || isProcessing}
                    className="flex-1 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-5 h-5" />
                    {isProcessing ? 'Responding...' : 'Send Response'}
                  </button>
                  <button
                    onClick={endRoleplay}
                    disabled={isProcessing}
                    className="bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors"
                  >
                    End & Get Feedback
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* FEEDBACK PHASE */}
          {phase === 'feedback' && selectedScenario && finalScore !== null && (
            <div className="space-y-6">
              {/* Score */}
              <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border border-purple-500/30 rounded-xl p-6 text-center">
                <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-3xl font-bold text-white mb-2">{finalScore}/100</h3>
                <p className="text-purple-300 mb-4">{generateScoreFeedback(finalScore)}</p>
                <p className="text-gray-400 text-sm">
                  {criteriaChecked.filter(Boolean).length}/{selectedScenario.successCriteria.length} success
                  criteria met
                </p>
              </div>

              {/* AI Feedback */}
              {feedback && (
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-purple-300 mb-4 flex items-center gap-2">
                    <span>💡</span> Agnes's Feedback
                  </h4>
                  <div className="text-gray-300 whitespace-pre-wrap">{feedback}</div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => beginRoleplay()}
                  className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  Try Again
                </button>
                <button
                  onClick={resetRoleplay}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  Choose New Scenario
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
