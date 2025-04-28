import type { Timestamp } from 'firebase/firestore';

export interface Message {
  id: string;
  text: string;
  senderId: string;
  senderType: 'user' | 'agent';
  timestamp: Timestamp; // Use Firebase Timestamp type
}

export interface ChatMetadata {
    id: string; // Corresponds to user ID (or a unique chat session ID)
    userId: string;
    status: 'pending' | 'active' | 'closed';
    lastMessageTimestamp: Timestamp;
    // Add other relevant metadata like agentId if assigned
}

export interface TypingStatus {
    user?: boolean; // True if user is typing
    agent?: boolean; // True if agent is typing
}
