import { useState } from "react";
import { Outlet } from "react-router-dom";
import { X } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

export function AppShell() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-paper text-ink">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-line lg:block">
        <Sidebar />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div className="w-72 shrink-0 border-r border-line">
            <div className="flex items-center justify-end border-b border-line px-3 py-2">
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                aria-label="Close navigation menu"
                className="text-ink-soft hover:text-ink"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="h-[calc(100%-49px)]">
              <Sidebar onNavigate={() => setMobileNavOpen(false)} />
            </div>
          </div>
          <button
            type="button"
            aria-label="Close navigation menu"
            className="flex-1 bg-ink/20"
            onClick={() => setMobileNavOpen(false)}
          />
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar onMenuClick={() => setMobileNavOpen(true)} />
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
