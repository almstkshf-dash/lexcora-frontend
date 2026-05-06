'use client';

import React, { useState } from 'react';
import Image from 'next/image';
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
        <span className="sr-only">Open Rased Assistant</span>
        <Image
          src="/images/rased-icon.jpg"
          alt="Rased"
          fill
          className="object-cover"
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
