# **App Name**: RapidAssist

## Core Features:

- Anonymous Authentication: User authentication via Firebase anonymous authentication to allow guest users to start chatting immediately.
- Real-Time Chat: Real-time chat interface with message timestamps and clear sender distinction (user/agent) and typing indicators.
- Agent Interface: Agent interface to view and respond to active user chats.

## Style Guidelines:

- Primary color: Neutral white or light gray for a clean and professional look.
- Secondary color: Soft blue or green for accents and highlights.
- Accent: Teal (#008080) for interactive elements and CTAs.
- Clear and readable font for chat messages and UI elements.
- Responsive layout that adapts to different screen sizes.
- Simple and intuitive icons for common actions (send, attach, etc.).
- Subtle animations for typing indicators and new message notifications.

## Original User Request:
Build a real-time live agent chat application using Firebase, ViteJS, and ReactJS. The application should allow users to communicate with an agent in real-time, with a clean and responsive UI, leveraging Firebase for authentication, real-time database, and hosting.

Technologies





Frontend: ReactJS (using ViteJS as the build tool for fast development and hot module replacement)



Backend: Firebase (for real-time database, authentication, and hosting)



Styling: Tailwind CSS (via CDN for simplicity and rapid UI development)



JavaScript: Modern ES6+ syntax with JSX for React components


Functional Requirements





User Authentication:





Users can sign in anonymously using Firebase Authentication.



Optional: Allow email/password or Google sign-in for registered users.



Display the user’s status (e.g., "Guest" or username) in the chat interface.



Real-Time Chat:





Users can send and receive messages in real-time with an agent.



Messages are stored in Firebase Realtime Database or Firestore.



The chat should display messages with timestamps and sender information (e.g., "User" or "Agent").



Support for basic text messages; optional support for emojis or file uploads.



Agent Interface:





Agents have a separate interface to view and respond to user messages.



Agents can see a list of active users/chats and select a user to respond to.



Optional: Notify agents when a new user initiates a chat.



UI/UX:





Responsive design that works on both desktop and mobile devices.



Clean and modern UI using Tailwind CSS.



Display typing indicators (e.g., "Agent is typing...") using Firebase to track typing status.



Scrollable chat window that auto-scrolls to the latest message.



Real-Time Features:





Use Firebase Realtime Database or Firestore to sync messages instantly.



Show online/offline status for users and agents.



Optional: Implement read receipts for messages.
  