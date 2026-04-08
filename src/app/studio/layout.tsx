"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { label: "Voices", href: "/studio/voices", icon: "🎙️" },
  { label: "Dialogue", href: "/studio/dialogue", icon: "🎭" },
  { label: "History", href: "/studio/history", icon: "📜" },
];

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-56 border-r border-border bg-card flex flex-col shrink-0">
        <div className="p-4 border-b border-border">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight">VoiceCast</span>
          </Link>
          <p className="text-[10px] text-muted-foreground mt-0.5">Custom Voice Engine</p>
        </div>
        <nav className="flex-1 p-2 space-y-0.5">
          {NAV.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border">
          <Link href="/settings" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            ⚙️ Settings
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 overflow-auto">
        {children}
      </main>
    </div>
  );
}
