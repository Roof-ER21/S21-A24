/**
 * StateSelector Component
 * High-contrast UI for selecting Virginia, Maryland, or Pennsylvania
 * Persists selection to localStorage
 */

import React, { useState, useEffect } from 'react';
import { getStateInfo, getAvailableStates, getSusanTips } from '../lib/state-codes-va-md-pa';

interface StateSelectorProps {
  onStateChange?: (stateAbbr: string) => void;
  className?: string;
}

const STATE_STORAGE_KEY = 's21-a24-selected-state';

export default function StateSelector({ onStateChange, className = '' }: StateSelectorProps) {
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const availableStates = getAvailableStates();

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STATE_STORAGE_KEY);
    if (saved && ['VA', 'MD', 'PA'].includes(saved)) {
      setSelectedState(saved);
      onStateChange?.(saved);
    }
  }, [onStateChange]);

  const handleStateSelect = (stateAbbr: string) => {
    setSelectedState(stateAbbr);
    localStorage.setItem(STATE_STORAGE_KEY, stateAbbr);
    onStateChange?.(stateAbbr);
    setIsExpanded(false);
  };

  const handleClearState = () => {
    setSelectedState(null);
    localStorage.removeItem(STATE_STORAGE_KEY);
    onStateChange?.('');
  };

  const selectedStateInfo = selectedState ? getStateInfo(selectedState) : null;
  const susanTips = selectedState ? getSusanTips(selectedState) : [];

  return (
    <div className={`state-selector ${className}`}>
      {/* Header */}
      <div className="state-selector-header mb-3">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
          State Context
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Select your state for state-specific building codes and regulations
        </p>
      </div>

      {/* State Buttons */}
      <div className="state-buttons grid grid-cols-3 gap-2 mb-3">
        {availableStates.map((state) => {
          const isSelected = selectedState === state.value;
          return (
            <button
              key={state.value}
              onClick={() => handleStateSelect(state.value)}
              className={`state-button ${
                isSelected
                  ? 'bg-gradient-to-br from-[#c1121f] to-[#7f1d1d] text-white shadow-lg scale-105'
                  : 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 text-gray-700 dark:text-gray-300 hover:from-red-50 hover:to-red-50/50 dark:hover:from-red-900/30 dark:hover:to-red-900/30'
              } font-bold py-4 px-3 rounded-lg transition-all duration-200 transform hover:scale-105 border-2 ${
                isSelected
                  ? 'border-red-400'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              aria-pressed={isSelected}
            >
              <div className="text-2xl font-black">{state.value}</div>
              <div className="text-xs mt-1 font-medium opacity-90">
                {state.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected State Info */}
      {selectedStateInfo && (
        <div className="selected-state-info bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 rounded-lg p-4 mb-3">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4 className="text-lg font-bold text-red-900 dark:text-red-100">
                {selectedStateInfo.name}
              </h4>
              <p className="text-sm text-red-700 dark:text-red-300">
                {selectedStateInfo.ircVersion}
              </p>
              <p className="text-xs text-red-600 dark:text-red-400">
                Effective: {selectedStateInfo.ircEffectiveDate}
              </p>
            </div>
            <button
              onClick={handleClearState}
              className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 underline"
              aria-label="Clear state selection"
            >
              Clear
            </button>
          </div>

          {/* Toggle Details */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full text-left text-sm font-semibold text-red-700 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100 flex items-center justify-between"
          >
            <span>{isExpanded ? 'Hide Details' : 'Show Details'}</span>
            <svg
              className={`w-4 h-4 transform transition-transform ${
                isExpanded ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Expanded Details */}
          {isExpanded && (
            <div className="mt-3 space-y-3">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white dark:bg-gray-800 rounded p-2">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Building Codes
                  </div>
                  <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                    {selectedStateInfo.buildingCodes.length}
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded p-2">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Special Reqs
                  </div>
                  <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                    {selectedStateInfo.specialRequirements.length}
                  </div>
                </div>
              </div>

              {/* Susan's Tips */}
              {susanTips.length > 0 && (
                <div className="susan-tips">
                  <div className="text-xs font-bold text-indigo-800 dark:text-indigo-200 mb-2">
                    SUSAN'S ACTION TIPS:
                  </div>
                  <ul className="space-y-1">
                    {susanTips.slice(0, 3).map((tip, idx) => (
                      <li
                        key={idx}
                        className="text-xs text-indigo-700 dark:text-indigo-300 pl-3 border-l-2 border-indigo-400"
                      >
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Critical Requirements */}
              {selectedStateInfo.specialRequirements
                .filter((r) => r.critical)
                .slice(0, 2)
                .map((req, idx) => (
                  <div
                    key={idx}
                    className="bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded p-2"
                  >
                    <div className="text-xs font-bold text-amber-800 dark:text-amber-200">
                      {req.requirement}
                    </div>
                    <div className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                      {req.details.substring(0, 150)}
                      {req.details.length > 150 ? '...' : ''}
                    </div>
                  </div>
                ))}

              {/* Top Codes by Success Rate */}
              <div className="top-codes">
                <div className="text-xs font-bold text-red-800 dark:text-red-200 mb-2">
                  TOP CODES BY SUCCESS RATE:
                </div>
                <div className="space-y-1">
                  {selectedStateInfo.buildingCodes
                    .filter((c) => c.successRate && c.successRate >= 90)
                    .slice(0, 3)
                    .map((code, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs bg-white dark:bg-gray-800 rounded p-2"
                      >
                        <div>
                          <span className="font-mono font-bold text-red-600 dark:text-red-400">
                            {code.code}
                          </span>
                          <span className="text-gray-600 dark:text-gray-400 ml-2">
                            {code.citation}
                          </span>
                        </div>
                        <div className="font-bold text-green-600 dark:text-green-400">
                          {code.successRate}%
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* No State Selected */}
      {!selectedState && (
        <div className="no-state-info bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Select a state above to load state-specific building codes and regulations
          </p>
        </div>
      )}

      <style jsx>{`
        .state-selector {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .state-button {
          cursor: pointer;
          user-select: none;
        }

        .state-button:focus {
          outline: 2px solid #6366f1;
          outline-offset: 2px;
        }

        .state-button:active {
          transform: scale(0.95);
        }

        .selected-state-info {
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .susan-tips li {
          animation: fadeIn 0.4s ease-out backwards;
        }

        .susan-tips li:nth-child(1) {
          animation-delay: 0.1s;
        }
        .susan-tips li:nth-child(2) {
          animation-delay: 0.2s;
        }
        .susan-tips li:nth-child(3) {
          animation-delay: 0.3s;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Hook for using state selection in other components
 */
export function useStateSelection() {
  const [selectedState, setSelectedState] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STATE_STORAGE_KEY);
    if (saved) {
      setSelectedState(saved);
    }

    // Listen for storage changes (cross-tab sync)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STATE_STORAGE_KEY) {
        setSelectedState(e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const selectState = (stateAbbr: string) => {
    setSelectedState(stateAbbr);
    localStorage.setItem(STATE_STORAGE_KEY, stateAbbr);
  };

  const clearState = () => {
    setSelectedState(null);
    localStorage.removeItem(STATE_STORAGE_KEY);
  };

  return {
    selectedState,
    selectState,
    clearState,
    stateInfo: selectedState ? getStateInfo(selectedState) : null,
  };
}
