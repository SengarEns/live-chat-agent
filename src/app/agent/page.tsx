import { AgentDashboard } from '@/components/agent/agent-dashboard';
import { AuthProvider } from '@/components/providers/auth-provider';
// Removed Toaster import, relying on the global layout Toaster

export default function AgentPage() {
  // Agent-specific auth checks can remain if needed
  return (
    <AuthProvider>
        {/* Remove min-h-screen and flex-col as layout handles this */}
        {/* Let AgentDashboard fill the available space */}
        <AgentDashboard />
     </AuthProvider>
  );
}
