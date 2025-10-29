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
    <div className="hidden md:flex flex-col w-80 s21-sidebar text-white">
      <div className="flex items-center justify-center h-24 border-b border-white/10">
        <Logo className="h-12" />
      </div>
      <nav className="flex-1 px-4 py-6 space-y-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePanel === (item.id as PanelType);

          return (
            <button
              key={item.id}
              onClick={() => setActivePanel(item.id as PanelType)}
              className={cn('s21-nav-btn', isActive && 'active')}
            >
              <Icon className="icon" />
              <span className="text-sm font-semibold tracking-wide">{item.label}</span>
              {item.badge && (
                <span className="ml-auto s21-provider-pill text-[10px]">{item.badge}</span>
              )}
            </button>
          );
        })}
      </nav>
      <div className="p-4 border-t border-white/10 text-xs text-white/60">
        <p>&copy; 2024 S21 Labs</p>
        <p>Gemini Interface v1.0</p>
      </div>
    </div>
  );
};

export default Sidebar;
