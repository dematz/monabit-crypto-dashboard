import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Settings,
  Sparkles,
  LogOut,
  Bitcoin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/app-store";
import { Button } from "@/components/ui/button";

type NavItem = {
  to: "/" | "/users" | "/settings";
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
  adminOnly?: boolean;
};

const NAV: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/users", label: "Usuarios", icon: Users, adminOnly: true },
  { to: "/settings", label: "Preferencias", icon: Settings },
];

type Props = { onNavigate?: () => void };

export function AppSidebar({ onNavigate }: Props) {
  const pathname = useLocation().pathname;
  const user = useAppStore((s) => s.user);
  const setAiOpen = useAppStore((s) => s.setAiOpen);
  const logout = useAppStore((s) => s.logout);

  return (
    <aside className="flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-brand text-brand-foreground">
          <Bitcoin className="h-5 w-5" />
        </div>
        <div>
          <p className="text-base font-semibold tracking-tight text-gradient-brand">MonaBit</p>
          <p className="text-[11px] text-muted-foreground">Crypto Intelligence</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV.filter((n) => !n.adminOnly || user?.role === "Admin").map(
          (item) => {
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={onNavigate}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          },
        )}
      </nav>

      <div className="space-y-2 border-t border-sidebar-border p-3">
        <Button
          variant="outline"
          className="w-full justify-start gap-2 border-brand/40 bg-brand/10 text-foreground hover:bg-brand/20"
          onClick={() => {
            setAiOpen(true);
            onNavigate?.();
          }}
        >
          <Sparkles className="h-4 w-4 text-brand" />
          Asistente IA
        </Button>
        {user && (
          <div className="flex items-center gap-3 rounded-lg px-3 py-2">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-accent text-sm font-semibold">
              {user.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground">{user.role}</p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
              aria-label="Cerrar sesión"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
