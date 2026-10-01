import { NavLink } from "react-router-dom";
import { clsx } from "clsx";
import { NAV_GROUPS } from "@/router/routes";
import { ShieldCheck } from "lucide-react";

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col bg-paper-dim">
      <div className="flex items-center gap-2.5 border-b border-line px-5 py-5">
        <ShieldCheck className="h-5 w-5 text-accent" aria-hidden />
        <div>
          <p className="font-display text-sm font-semibold leading-tight text-ink">Case Preparation Workspace</p>
          <p className="text-xs leading-tight text-ink-faint">Private &amp; simulation-based</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-5 last:mb-0">
            <p className="px-2.5 pb-1.5 text-xs text-ink-faint">{group.label}</p>
            <ul className="space-y-0.5">
              {group.items.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    end={item.path === "/"}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      clsx(
                        "flex items-center gap-2.5 border-l-2 px-2.5 py-1.5 text-sm transition-colors",
                        isActive
                          ? "border-accent bg-surface font-medium text-ink"
                          : "border-transparent text-ink-soft hover:border-line-strong hover:bg-surface/60 hover:text-ink",
                      )
                    }
                  >
                    <item.icon className="h-4 w-4 shrink-0" aria-hidden />
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-line px-5 py-4">
        <p className="text-xs leading-snug text-ink-faint">
          This workspace uses AI simulations to help you prepare. It is not affiliated with BAMF, any
          court, or the German government, and nothing here is legal advice.
        </p>
      </div>
    </div>
  );
}
