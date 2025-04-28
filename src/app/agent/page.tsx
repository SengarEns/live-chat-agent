import { AgentDashboard } from '@/components/agent/agent-dashboard';
import { AuthProvider } from '@/components/providers/auth-provider'; // Reuse auth provider if agent login needed
import { Toaster } from "@/components/ui/toaster";

export default function AgentPage() {
  // Potential: Add agent-specific authentication/authorization checks here
  return (
    // If agents need to log in differently, create a specific AgentAuthProvider
    // For now, assuming agents might also use the app or have admin access
    <AuthProvider>
        <main className="flex min-h-screen flex-col">
            <AgentDashboard />
            <Toaster />
        </main>
     </AuthProvider>
  );
}
