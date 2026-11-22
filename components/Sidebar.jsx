"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  CheckSquare,
  FileCheck,
  CreditCard,
  BarChart3,
  X,
  Sparkles,
} from "lucide-react";

// Navigation links for the sidebar
const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Clients", href: "/clients", icon: Users },
  { name: "Projects", href: "/projects", icon: Briefcase },
  { name: "Tasks & Milestones", href: "/tasks", icon: CheckSquare },
  { name: "Deliverables", href: "/deliverables", icon: FileCheck },
  { name: "Payments", href: "/payments", icon: CreditCard },
  { name: "Reports", href: "/reports", icon: BarChart3 },
];

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();

  // Helper to determine if a route is currently active
  const isActive = (href) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile backdrop overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 bg-forest text-white transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-forest-light">
          <Link href="/" className="flex items-center gap-3" onClick={onClose}>
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-copper text-forest-dark font-bold text-xl shadow-md">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">FreelanceFlow</h1>
              <p className="text-xs text-sage-border font-medium">Business Management</p>
            </div>
          </Link>

          {/* Close button on mobile */}
          <button
            onClick={onClose}
            className="p-1 rounded-md text-sage-border hover:text-white hover:bg-forest-light lg:hidden"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-sage text-white shadow-sm"
                    : "text-gray-300 hover:text-white hover:bg-forest-light"
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? "text-copper-light" : "text-gray-400"}`} />
                <span>{item.name}</span>
                {active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-copper-light" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar footer badge */}
        <div className="p-4 mx-4 mb-4 rounded-lg bg-forest-dark/70 border border-forest-light">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-copper animate-pulse" />
            <span className="text-xs font-semibold text-copper-light">College Project Demo</span>
          </div>
          <p className="text-[11px] text-gray-300 leading-relaxed">
            Full-stack portfolio system built with Next.js & MongoDB.
          </p>
        </div>
      </aside>
    </>
  );
}
