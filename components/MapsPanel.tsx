import React, { useState, useEffect } from 'react';
import '../src/sa21-chat.css';
import { searchMaps } from '../services/geminiService';
import Spinner from './Spinner';
import { GroundingChunk } from '../types';

interface Location {
  latitude: number;
  longitude: number;
}

const MapsPanel: React.FC = () => {
  const [query, setQuery] = useState('');
  const [resultText, setResultText] = useState('');
  const [chunks, setChunks] = useState<GroundingChunk[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [location, setLocation] = useState<Location | undefined>(undefined);
  const [locationError, setLocationError] = useState('');

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocationError('');
      },
      (err) => {
        console.warn(`Could not get location: ${err.message}`);
        setLocationError('Location access denied. Search results may be less relevant.');
      }
    );
  }, []);

  const handleSearch = async () => {
    if (!query.trim() || isLoading) return;
    setIsLoading(true);
    setError('');
    setResultText('');
    setChunks([]);

    try {
      const { text, chunks } = await searchMaps(query, location);
      setResultText(text);
      setChunks(chunks);
    } catch (err) {
      console.error('Error searching Maps:', err);
      setError('Failed to perform search. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="sa21-root">
      <div className="sa21-header" style={{ position: 'relative' }}>
        <div className="sa21-logo-row">
          <div className="sa21-logo">ROOF ER</div>
          <div className="sa21-title">S21 FIELD // Maps</div>
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
          <button className="qa-btn" onClick={() => setQuery('roofing supply near me')}>Roof supply near me</button>
          <button className="qa-btn" onClick={() => setQuery('dumpsters near me')}>Dumpsters near me</button>
        </aside>
        <section className="sa21-chat">
          <div className="sa21-chat-header">Maps Search</div>
          <div className="sa21-page-body">
            <div className="flex items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="e.g., 'What good Italian restaurants are nearby?'"
          className="flex-1 p-3 bg-transparent border border-white/20 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-[var(--s21-secondary)]/40 text-white"
          disabled={isLoading}
        />
        <button
          onClick={handleSearch}
          disabled={!query.trim() || isLoading}
          className="sa21-btn send px-6 py-3 rounded-r-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? <Spinner /> : 'Search'}
        </button>
      </div>
      {locationError && <p className="text-yellow-400 text-sm">{locationError}</p>}
      <div className="flex-1 rounded-lg p-4 overflow-y-auto border border-white/15 bg-white/5 mt-4">
        <h3 className="text-lg font-semibold mb-2 text-white">Search Result</h3>
        {error && <p className="text-red-400">{error}</p>}
        {resultText && <p className="whitespace-pre-wrap text-white/90">{resultText}</p>}

        {chunks.length > 0 && (
          <div className="mt-4 pt-4 border-t border-zinc-700">
            <h4 className="font-semibold text-white/70 mb-2">Sources:</h4>
            <ul className="list-disc list-inside space-y-1">
              {chunks.map((chunk, index) => {
                const source = chunk.maps || chunk.web;
                if (!source) return null;
                return (
                  <li key={index}>
                    <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-red-400 hover:underline">
                      {source.title}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {!isLoading && !resultText && !error && (
          <p className="text-white/60">Results will appear here.</p>
        )}
        {isLoading && (
          <div className="flex items-center justify-center h-full">
            <div className="flex items-center text-white/70">
              <Spinner /> Searching...
            </div>
          </div>
        )}
      </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default MapsPanel;
