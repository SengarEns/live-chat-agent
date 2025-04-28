"use client";

import type { ChatMetadata } from '@/types/chat';
import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ChatList } from './chat-list';
import { AgentChatWindow } from './agent-chat-window';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Skeleton } from '@/components/ui/skeleton';

export function AgentDashboard() {
  const [activeChats, setActiveChats] = useState<ChatMetadata[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [loadingChats, setLoadingChats] = useState(true);

  useEffect(() => {
    setLoadingChats(true);
    // Query active chats (e.g., status is 'active' or 'pending') ordered by last message time
    const chatsQuery = query(
      collection(db, 'chats'),
      // where('status', 'in', ['active', 'pending']), // Example filter
      orderBy('lastMessageTimestamp', 'desc')
    );

    const unsubscribe = onSnapshot(chatsQuery, (snapshot) => {
      const fetchedChats = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as ChatMetadata));
      setActiveChats(fetchedChats);
       setLoadingChats(false);
    }, (error) => {
        console.error("Error fetching active chats:", error);
        setLoadingChats(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId);
  };

  return (
    <ResizablePanelGroup direction="horizontal" className="min-h-screen w-full">
      <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
         {loadingChats ? (
              <div className="p-4 space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
         ) : (
             <ChatList
                chats={activeChats}
                selectedChatId={selectedChatId}
                onSelectChat={handleSelectChat}
             />
         )}

      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={75}>
        <AgentChatWindow chatId={selectedChatId} />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
