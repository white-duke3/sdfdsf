import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import Sidebar from '../components/Sidebar';
import ChatArea from '../components/ChatArea';
import SettingsModal from '../components/SettingsModal';

export default function MessengerPage() {
  const { state } = useApp();
  const [showSettings, setShowSettings] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (state.activeConversationId && isMobile) {
      setShowChat(true);
    }
  }, [state.activeConversationId, isMobile]);

  return (
    <div className="h-screen flex overflow-hidden" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Sidebar */}
      {(!isMobile || !showChat) && (
        <Sidebar
          onOpenSettings={() => setShowSettings(true)}
          isMobile={isMobile && !showChat}
        />
      )}

      {/* Chat Area */}
      {(!isMobile || showChat) && (
        <ChatArea
          onBack={isMobile ? () => setShowChat(false) : undefined}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}
