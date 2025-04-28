"use client";

import type { ChatMetadata } from '@/types/chat';
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { User } from 'lucide-react'; // Use a generic user icon

interface ChatListProps {
  chats: ChatMetadata[];
  selectedChatId: string | null;
  onSelectChat: (chatId: string) => void;
}

export function ChatList({ chats, selectedChatId, onSelectChat }: ChatListProps) {
  return (
    <Card className="h-full flex flex-col">
        <CardHeader>
            <CardTitle>Active Chats</CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex-1">
             <ScrollArea className="h-full">
                <div className="p-4 space-y-2">
                {chats.length === 0 && <p className="text-muted-foreground text-center py-4">No active chats.</p>}
                {chats.map((chat) => (
                    <Button
                    key={chat.id}
                    variant={selectedChatId === chat.id ? 'secondary' : 'ghost'}
                    className="w-full justify-start h-auto p-3"
                    onClick={() => onSelectChat(chat.id)}
                    >
                    <User className="mr-3 h-5 w-5 text-muted-foreground" />
                    <div className="flex-1 text-left">
                        <p className="font-medium truncate">User {chat.userId.substring(0, 6)}...</p>
                        <p className="text-xs text-muted-foreground">
                            Last message: {chat.lastMessageTimestamp ? formatDistanceToNow(chat.lastMessageTimestamp.toDate(), { addSuffix: true }) : 'N/A'}
                        </p>
                    </div>
                     <Badge variant={chat.status === 'active' ? 'default' : 'outline'} className="ml-2">{chat.status}</Badge>
                    </Button>
                ))}
                </div>
            </ScrollArea>
         </CardContent>
    </Card>
  );
}
