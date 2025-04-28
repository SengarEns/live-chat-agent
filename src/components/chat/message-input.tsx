"use client";

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SendHorizonal } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (text: string) => void;
  onTyping: (isTyping: boolean) => void;
}

export function MessageInput({ onSendMessage, onTyping }: MessageInputProps) {
  const [message, setMessage] = useState('');
  let typingTimeout: NodeJS.Timeout | null = null;

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
    onTyping(true);

    // Clear previous timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Set new timeout to stop typing indicator
    typingTimeout = setTimeout(() => {
      onTyping(false);
    }, 1500); // Consider user stopped typing after 1.5 seconds of inactivity
  };

  const handleSendMessage = (event: React.FormEvent) => {
    event.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
      onTyping(false); // Ensure typing indicator stops on send
      if (typingTimeout) clearTimeout(typingTimeout); // Clear timeout on send
    }
  };

  return (
    <form onSubmit={handleSendMessage} className="flex items-center gap-2 border-t p-4">
      <Input
        type="text"
        placeholder="Type your message..."
        value={message}
        onChange={handleInputChange}
        className="flex-1"
        aria-label="Chat message input"
      />
      <Button type="submit" size="icon" aria-label="Send message">
        <SendHorizonal />
      </Button>
    </form>
  );
}
