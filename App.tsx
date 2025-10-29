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
    <div className="flex h-screen bg-zinc-800 font-sans">
      <Sidebar activePanel={activePanel} setActivePanel={setActivePanel} />
      <main className="flex-1">
        {renderPanel()}
      </main>
      {/* Status Dashboard - Floating bottom-right */}
      <StatusDashboard />
    </div>
  );
};

export default App;
