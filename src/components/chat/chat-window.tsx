"use client";

import type { Message, TypingStatus } from '@/types/chat';
import React, { useState, useEffect, useCallback } from 'react';
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/components/providers/auth-provider';
import { MessageList } from './message-list';
import { MessageInput } from './message-input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export function ChatWindow() {
  const { user, loading: authLoading } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [chatId, setChatId] = useState<string | null>(null);
  const [agentTyping, setAgentTyping] = useState(false);

  // Effect to set chatId based on user ID
  useEffect(() => {
    if (user) {
      setChatId(user.uid); // Use user's UID as the chat ID
    }
  }, [user]);

  // Effect to subscribe to messages
  useEffect(() => {
    if (!chatId || !user) return;

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
        console.error("Error fetching messages:", error);
        setLoadingMessages(false); // Stop loading on error
    });

    // Subscribe to agent typing status
    const typingDocRef = doc(db, 'typingStatus', chatId);
    const unsubscribeTyping = onSnapshot(typingDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data() as TypingStatus;
        // Check if the agent is typing (ignore user's own typing status)
        setAgentTyping(data.agent || false);
      } else {
        setAgentTyping(false);
      }
    }, (error) => {
        console.error("Error fetching typing status:", error);
    });


    return () => {
        unsubscribeMessages();
        unsubscribeTyping();
    }
  }, [chatId, user]);

  const handleSendMessage = useCallback(async (text: string) => {
    if (!user || !chatId) return;

    try {
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        text,
        senderId: user.uid,
        senderType: 'user', // Hardcode senderType as 'user' for messages sent from this component
        timestamp: serverTimestamp(),
      });
      // Update chat metadata (e.g., last message time) if needed
        await setDoc(doc(db, 'chats', chatId), {
            lastMessageTimestamp: serverTimestamp(),
            userId: user.uid,
            status: 'active', // Or 'pending' if agent hasn't responded yet
        }, { merge: true });
    } catch (error) {
      console.error('Error sending message:', error);
      // Handle error (e.g., show a toast notification)
    }
  }, [user, chatId]);

   const handleTyping = useCallback(async (isTyping: boolean) => {
        if (!user || !chatId) return;
        const typingDocRef = doc(db, 'typingStatus', chatId);
        try {
             await setDoc(typingDocRef, { user: isTyping }, { merge: true });
        } catch (error) {
            console.error("Error updating user typing status:", error);
        }
    }, [user, chatId]);


  if (authLoading || !user) {
    return (
        <Card className="w-full max-w-md mx-auto h-[600px] flex flex-col shadow-lg rounded-lg">
           <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
             <CardTitle className="text-lg font-semibold">RapidAssist Chat</CardTitle>
             <Skeleton className="h-6 w-20 rounded-md" />
           </CardHeader>
           <CardContent className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-4">
                     <Skeleton className="h-16 w-3/4 rounded-lg" />
                     <Skeleton className="h-16 w-3/4 ml-auto rounded-lg bg-primary/20" />
                     <Skeleton className="h-12 w-1/2 rounded-lg" />
                 </div>
           </CardContent>
           <CardFooter className="p-4 border-t">
                <Skeleton className="h-10 w-full rounded-md" />
           </CardFooter>
         </Card>
    );
  }


  return (
    <Card className="w-full max-w-md mx-auto h-[600px] flex flex-col shadow-lg rounded-lg overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between p-4 border-b bg-card">
        <CardTitle className="text-lg font-semibold">RapidAssist Chat</CardTitle>
        <Badge variant="secondary">Guest User</Badge> {/* Or display username if available */}
      </CardHeader>
        {loadingMessages ? (
             <CardContent className="flex-1 p-4 flex items-center justify-center">
                 <p>Loading messages...</p>
            </CardContent>
        ) : (
            <MessageList messages={messages} userId={user.uid} agentTyping={agentTyping} />
        )}

      <MessageInput onSendMessage={handleSendMessage} onTyping={handleTyping} />
    </Card>
  );
}
