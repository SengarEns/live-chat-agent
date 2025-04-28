"use client";

import type { Message } from '@/types/chat';
import React, { useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface MessageListProps {
  messages: Message[];
  userId: string | null;
  agentTyping: boolean;
}

export function MessageList({ messages, userId, agentTyping }: MessageListProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    // Auto-scroll to bottom when messages change or agent starts/stops typing
    if (viewportRef.current) {
        viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [messages, agentTyping]);


  return (
    <ScrollArea className="flex-1 p-4" ref={scrollAreaRef} viewportRef={viewportRef}>
      <div className="space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'flex gap-3',
              message.senderId === userId ? 'justify-end' : 'justify-start'
            )}
          >
            {message.senderId !== userId && (
              <Avatar className="h-8 w-8">
                <AvatarFallback>{message.senderType === 'agent' ? 'A' : 'U'}</AvatarFallback>
              </Avatar>
            )}
            <div
              className={cn(
                'max-w-[75%] rounded-lg p-3 shadow-sm',
                message.senderId === userId
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground'
              )}
            >
              <p className="text-sm">{message.text}</p>
              <p className="mt-1 text-xs opacity-70">
                {message.timestamp ? format(message.timestamp.toDate(), 'p') : 'Sending...'}
              </p>
            </div>
             {message.senderId === userId && (
              <Avatar className="h-8 w-8">
                <AvatarFallback>Y</AvatarFallback> {/* You */}
              </Avatar>
            )}
          </div>
        ))}
        {agentTyping && (
          <div className="flex justify-start gap-3 items-center">
             <Avatar className="h-8 w-8">
                <AvatarFallback>A</AvatarFallback>
              </Avatar>
            <div className="text-sm text-muted-foreground italic animate-pulse">
              Agent is typing...
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
