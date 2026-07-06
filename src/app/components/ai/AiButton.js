'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LegalChatPopup from './LegalChatPopup';
import { useLanguage } from '@/contexts/LanguageContext';

function AiButton() {
  const { isRTL } = useLanguage();
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      {/* Fixed Button in Bottom Corner - position based on language */}
      <Button
        onClick={() => setIsChatOpen(true)}
        className={`fixed bottom-6 ${isRTL ? 'left-6' : 'right-6'} z-40 bg-background hover:bg-muted text-foreground p-1.5 rounded-full shadow-2xl hover:shadow-primary/25 transition-all duration-300 hover:scale-105 flex items-center gap-3 group border border-border/50 ring-1 ring-primary/10 print-hide`}
        aria-label={isRTL ? "راصد" : "Rased Assistant"}
      >
        <span className="sr-only">{isRTL ? "راصد" : "Rased Assistant"}</span>
        <div className="relative h-14 w-14 rounded-full overflow-hidden border border-primary/20 shadow-md bg-background shrink-0">
          <Image src="/images/rased-icon.jpg" alt="Rased" fill className="object-cover" />
        </div>
        <span className="text-base font-bold hidden md:inline px-3 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
          {isRTL ? 'اسأل راصد' : 'Ask Rased'}
        </span>
        {/* Glow effect */}
        <span className="absolute inset-0 rounded-full bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none -z-10"></span>
      </Button>

      {/* Chat Popup */}
      <LegalChatPopup 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
      />
    </>
  );
}

export default AiButton;