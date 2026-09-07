"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  ShieldAlert,
  BookOpen,
  UserCheck,
  Settings,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

export function DashboardSidebar() {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);

  const studentLinks = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "My Uploads", href: "/dashboard/uploads", icon: FileText },
    { name: "Saved Notes", href: "/dashboard/saved", icon: BookOpen },
  ];

  const adminLinks = [
    { name: "Moderation Queue", href: "/admin/moderation", icon: ShieldAlert },
    { name: "Directory Control", href: "/admin/directory", icon: UserCheck },
    { name: "System Audit Logs", href: "/admin/audit", icon: Settings },
  ];

  const links =
    user?.role === "admin" ? [...studentLinks, ...adminLinks] : studentLinks;

  return (
    <aside className="w-full md:w-64 bg-card border-r border-border h-[calc(100vh-4rem)] p-4 flex flex-col justify-between hidden md:flex">
      <div className="space-y-6">
        <div className="px-3 py-2">
          <h2 className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
            {user?.role === "admin" ? "Administration" : "Student Workspace"}
          </h2>
        </div>
        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-3 rounded-lg bg-background/50 border border-border text-xs text-muted-foreground">
        <p className="font-semibold text-foreground mb-1">Academic Precision</p>
        LAUTECH institutional security protocols active.
      </div>
    </aside>
  );
}
