
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Users, MessageSquare } from 'lucide-react'; // Import icons

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
           {/* Replace with a proper logo if available */}
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary">
                <path d="M12 6v12M18 6v12M6 6v12M3 9h18M3 15h18"/>
           </svg>
           <span className="font-bold text-lg">RapidAssist</span>
        </Link>
        <nav className="flex items-center space-x-2">
          <Button
            asChild
            variant={pathname === '/' ? 'secondary' : 'ghost'}
            className={cn("transition-colors")}
          >
            <Link href="/">
               <MessageSquare className="mr-2 h-4 w-4" /> User Chat
            </Link>
          </Button>
          <Button
            asChild
             variant={pathname === '/agent' ? 'secondary' : 'ghost'}
             className={cn("transition-colors")}
          >
            <Link href="/agent">
                <Users className="mr-2 h-4 w-4" /> Agent Dashboard
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
