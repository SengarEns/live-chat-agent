import { AuthProvider } from '@/components/providers/auth-provider';
import { ChatWindow } from '@/components/chat/chat-window';
import { Toaster } from "@/components/ui/toaster"; // Import Toaster

export default function Home() {
  return (
    <AuthProvider>
      <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-secondary via-background to-muted">
        <h1 className="text-4xl font-bold mb-8 text-primary">RapidAssist</h1>
        <ChatWindow />
        <Toaster /> {/* Add Toaster here */}
      </main>
    </AuthProvider>
  );
}
