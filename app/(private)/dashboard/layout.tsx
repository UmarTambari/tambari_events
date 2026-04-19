"use client";

import { useState }     from "react";
import Link             from "next/link";
import { usePathname }  from "next/navigation";
import {
  Calendar,
  LayoutDashboard,
  ShoppingBag,
  User,
  Menu,
  X,
  Plus,
  LogOut,
}                 from "lucide-react";
import { cn }     from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
}                 from "@/components/ui/dropdown-menu";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Events", href: "/dashboard/events", icon: Calendar },
  { name: "Orders", href: "/dashboard/orders", icon: ShoppingBag },
  { name: "Profile", href: "/dashboard/profile", icon: User },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#EFE3C2]">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-[#123524] transform transition-transform duration-300 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-[#3E7B27]">
            <Link href="/dashboard" className="text-xl font-bold text-[#EFE3C2]">
              Tambari EventHub
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-[#EFE3C2]"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[#3E7B27] text-[#EFE3C2]"
                      : "text-[#85A947] hover:bg-[#3E7B27]/50 hover:text-[#EFE3C2]"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-[#3E7B27]">
            <Link href="/dashboard/events/create">
              <Button className="w-full bg-[#85A947] hover:bg-[#3E7B27] text-[#123524] font-semibold">
                <Plus className="mr-2 h-4 w-4" />
                Create Event
              </Button>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-[#85A947]/20 bg-white/80 backdrop-blur-sm px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-[#123524]"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex-1" />

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full bg-[#85A947] text-white hover:bg-[#3E7B27]"
              >
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile">Profile Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}