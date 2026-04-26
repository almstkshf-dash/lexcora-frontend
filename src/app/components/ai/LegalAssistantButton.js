'use client';

import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LegalChatPopup from './LegalChatPopup';

function LegalAssistantButton() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      {/* Header Button */}
      <Button
        onClick={() => setIsChatOpen(true)}
        variant="ghost"
        size="icon"
        className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-primary/20 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 p-0"
        aria-label="Open Rased Assistant"
      >
        <img 
          src="/images/rased-icon.jpg" 
          alt="Rased" 
          className="h-full w-full object-cover"
        />
      </Button>

      {/* Chat Popup */}
      <LegalChatPopup 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
      />
    </>
  );
}

export default LegalAssistantButton;
