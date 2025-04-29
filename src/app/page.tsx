import { AuthProvider } from '@/components/providers/auth-provider';
import { ChatWindow } from '@/components/chat/chat-window';
import { Toaster } from "@/components/ui/toaster";

export default function Home() {
  return (
    <AuthProvider>
      {/* Remove background gradient and center alignment, let layout handle structure */}
      <div className="flex flex-1 flex-col items-center justify-center p-4">
        {/* Removed h1 as header provides branding */}
        <ChatWindow />
        {/* Keep Toaster if specific page-level toasts needed, otherwise layout toaster is fine */}
        {/* <Toaster /> */}
      </div>
    </AuthProvider>
  );
}
