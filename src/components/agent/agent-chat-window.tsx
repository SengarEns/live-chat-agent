"use client";

import type { Message, TypingStatus } from '@/types/chat';
import React, { useState, useEffect, useCallback } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
// Assuming agent authentication uses the same provider for now
import { useAuth } from '@/components/providers/auth-provider';
import { MessageList } from '@/components/chat/message-list'; // Reuse message list
import { MessageInput } from '@/components/chat/message-input'; // Reuse message input
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface AgentChatWindowProps {
  chatId: string | null;
}

export function AgentChatWindow({ chatId }: AgentChatWindowProps) {
  const { user: agentUser, loading: authLoading } = useAuth(); // Assuming agent logs in
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [userTyping, setUserTyping] = useState(false); // Track user typing status


  useEffect(() => {
    if (!chatId || !agentUser) {
        setMessages([]); // Clear messages if no chat is selected
        setLoadingMessages(false);
        return;
    }


    setLoadingMessages(true);
    const messagesQuery = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
      const fetchedMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Message));
      setMessages(fetchedMessages);
      setLoadingMessages(false);
    }, (error) => {
        console.error(`Error fetching messages for chat ${chatId}:`, error);
        setLoadingMessages(false);
    });

    // Subscribe to user typing status for this chat
    const typingDocRef = doc(db, 'typingStatus', chatId);
    const unsubscribeTyping = onSnapshot(typingDocRef, (docSnapshot) => {
       if (docSnapshot.exists()) {
         const data = docSnapshot.data() as TypingStatus;
         setUserTyping(data.user || false);
       } else {
         setUserTyping(false);
       }
     }, (error) => {
        console.error("Error fetching typing status:", error);
    });


    return () => {
        unsubscribeMessages();
        unsubscribeTyping();
    };
  }, [chatId, agentUser]);

  const handleSendMessage = useCallback(async (text: string) => {
    if (!agentUser || !chatId) return;

    try {
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        text,
        senderId: agentUser.uid, // Agent's ID
        senderType: 'agent', // Mark as agent message
        timestamp: serverTimestamp(),
      });
       // Update chat metadata
       await setDoc(doc(db, 'chats', chatId), {
            lastMessageTimestamp: serverTimestamp(),
            status: 'active', // Ensure chat is marked active when agent responds
        }, { merge: true });

    } catch (error) {
      console.error('Error sending message as agent:', error);
    }
  }, [agentUser, chatId]);


   const handleTyping = useCallback(async (isTyping: boolean) => {
        if (!agentUser || !chatId) return;
        const typingDocRef = doc(db, 'typingStatus', chatId);
        try {
            // Update only the agent's typing status
             await setDoc(typingDocRef, { agent: isTyping }, { merge: true });
        } catch (error) {
            console.error("Error updating agent typing status:", error);
        }
    }, [agentUser, chatId]);


  if (authLoading) {
      return <Skeleton className="h-full w-full" />; // Simple loading for agent window
  }

  if (!chatId) {
      return (
           <Card className="h-full flex items-center justify-center">
                <CardContent className="text-center text-muted-foreground">
                    <p className="text-lg">Select a chat to start messaging.</p>
                </CardContent>
            </Card>
      );
  }


  return (
    <Card className="h-full flex flex-col shadow-none border-0 rounded-none">
      <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
        <CardTitle className="text-lg font-semibold">Chat with User {chatId.substring(0, 6)}...</CardTitle>
        {/* Potentially show user status here */}
      </CardHeader>
      {loadingMessages ? (
         <CardContent className="flex-1 p-4 flex items-center justify-center">
             <p>Loading messages...</p>
        </CardContent>
      ) : (
        // Pass agent's ID to MessageList to correctly identify sender
        // Pass userTyping status instead of agentTyping
        <MessageList messages={messages} userId={agentUser?.uid ?? null} agentTyping={userTyping} />
      )}
      <MessageInput onSendMessage={handleSendMessage} onTyping={handleTyping} />
    </Card>
  );
}
