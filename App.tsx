import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatPanel from './components/ChatPanel';
import ImageAnalysisPanel from './components/ImageAnalysisPanel';
import TranscriptionPanel from './components/TranscriptionPanel';
import EmailPanel from './components/EmailPanel';
import MapsPanel from './components/MapsPanel';
import LivePanel from './components/LivePanel';
import KnowledgePanel from './components/KnowledgePanel';
import { StatusDashboard } from './components/StatusDashboard';
import MobileHeader from './components/MobileHeader';

type PanelType = 'chat' | 'image' | 'transcribe' | 'email' | 'maps' | 'live' | 'knowledge';

const App: React.FC = () => {
  const [activePanel, setActivePanel] = useState<PanelType>('chat');

  const renderPanel = () => {
    switch (activePanel) {
      case 'chat':
        return <ChatPanel />;
      case 'image':
        return <ImageAnalysisPanel />;
      case 'transcribe':
        return <TranscriptionPanel />;
      case 'email':
        return <EmailPanel />;
      case 'maps':
        return <MapsPanel />;
      case 'live':
        return <LivePanel />;
      case 'knowledge':
        return <KnowledgePanel />;
      default:
        return <ChatPanel />;
    }
  };

  return (
    <div className="min-h-screen h-screen font-sans s21-main-bg relative">
      {/* Mobile header (hide on Chat to allow custom header) */}
      {activePanel !== 'chat' && (
        <MobileHeader activePanel={activePanel} setActivePanel={setActivePanel} />
      )}

      {/* Background grid */}
      <div className="s21-grid"></div>

      {/* Desktop layout */}
      <div className="md:flex h-full pt-20 md:pt-0">
        {/* Hide global sidebar on Chat so page can use its own quick actions */}
        {activePanel !== 'chat' && (
          <Sidebar activePanel={activePanel} setActivePanel={setActivePanel} />
        )}
        <main className="flex-1 overflow-auto">
          {renderPanel()}
        </main>
      </div>

      {/* Status Dashboard - Floating bottom-right */}
      <StatusDashboard />
    </div>
  );
};

export default App;
