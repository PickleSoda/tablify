"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Users, Settings, Shield, Activity, Menu } from "lucide-react";

async function fetchTeamsForUser() {
  const response = await fetch("/api/teams");
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch teams");
  }
  return data.teams;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { data: teams, isLoading } = useQuery({
    queryKey: ["teamsForUser"], // Cache key
    queryFn: () => fetchTeamsForUser(), // Replace `1` with actual user ID
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const navItems = [
    { href: "/dashboard", icon: Users, label: "Home" },
    { href: "/dashboard/team", icon: Users, label: "Teams", subItems: teams },
    { href: "/dashboard/settings/general", icon: Settings, label: "General" },
    { href: "/dashboard/settings/activity", icon: Activity, label: "Activity" },
    { href: "/dashboard/settings/security", icon: Shield, label: "Security" },
  ];

  return (
    <div className="flex flex-col min-h-[calc(100dvh-68px)] mx-auto w-full">
      {/* Mobile header */}
      <div className="lg:hidden flex items-center justify-between bg-white border-b border-gray-200 p-4">
        <div className="flex items-center">
          <span className="font-medium">Settings</span>
        </div>
        <Button
          className="-mr-3"
          variant="ghost"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden h-full">
        {/* Sidebar */}
        <aside
          className={`w-64 bg-white lg:bg-gray-50 border-r border-gray-200 lg:block ${
            isSidebarOpen ? "block" : "hidden"
          } lg:relative absolute inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <nav className="h-full overflow-y-auto overflow-x-hidden p-4">
            {navItems.map((item) => (
              <div key={item.href}>
                <Link href={item.href} passHref>
                  <Button
                    variant={pathname === item.href ? "secondary" : "ghost"}
                    className={`my-1 w-full justify-start ${
                      pathname === item.href ? "bg-gray-100" : ""
                    }`}
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
                {/* Render sub-items (team names) */}
                {item.subItems &&
                  // !isLoading &&
                  item.subItems.map((team: any) => (
                    <Link
                      key={team.teamId}
                      href={`/dashboard/team/${team.teamId}`}
                    >
                      <Button
                        variant="ghost"
                        className="ml-8 my-1 w-full justify-start"
                      >
                        {team.name}
                      </Button>
                    </Link>
                  ))}
              </div>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-0 lg:p-4 max-w-7xl mx-auto">{children}</main>
      </div>
    </div>
  );
}
