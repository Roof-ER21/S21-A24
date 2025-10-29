import React from 'react';
import {
  MessageSquare,
  BookOpen,
  Image,
  Mic,
  Mail,
  MapPin,
  Radio
} from 'lucide-react';
import { cn } from '../lib/utils';
import Logo from './icons/Logo';

type PanelType = 'chat' | 'image' | 'transcribe' | 'email' | 'maps' | 'live' | 'knowledge';

interface SidebarProps {
  activePanel: PanelType;
  setActivePanel: (panel: PanelType) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activePanel, setActivePanel }) => {
  const navItems = [
    { id: 'chat', label: 'Chat', icon: MessageSquare, badge: 'AI' },
    { id: 'knowledge', label: 'Knowledge Base', icon: BookOpen, badge: 'RAG' },
    { id: 'image', label: 'Image Analyzer', icon: Image },
    { id: 'transcribe', label: 'Transcribe Note', icon: Mic },
    { id: 'email', label: 'Email Generator', icon: Mail },
    { id: 'maps', label: 'Maps Search', icon: MapPin },
    { id: 'live', label: 'Live Conversation', icon: Radio, badge: 'Live' },
  ];

  return (
    <div className="flex flex-col w-64 bg-zinc-900 text-white">
      <div className="flex items-center justify-center h-20 border-b border-zinc-800">
        <Logo className="h-12" />
      </div>
      <nav className="flex-1 px-2 py-4 space-y-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activePanel === item.id;

        return (
          <button
            key={item.id}
            onClick={() => setActivePanel(item.id as PanelType)}
            className={cn(
              'flex items-center w-full px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200',
              isActive ? 'bg-red-700 text-white' : 'text-zinc-400 hover:bg-zinc-700 hover:text-white'
            )}
          >
            <Icon className="w-6 h-6 mr-3" />
            <span>{item.label}</span>
          </button>
        );
      })}
      </nav>
      <div className="p-4 border-t border-zinc-800 text-xs text-zinc-500">
        <p>&copy; 2024 S21 Labs</p>
        <p>Gemini Interface v1.0</p>
      </div>
    </div>
  );
};

export default Sidebar;
