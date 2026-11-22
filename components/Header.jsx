"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Plus, UserPlus, FolderPlus } from "lucide-react";

// Helper to get readable title based on current path
function getPageTitle(pathname) {
  if (pathname === "/") return "Executive Dashboard";
  if (pathname.startsWith("/clients/new")) return "Add New Client";
  if (pathname.includes("/clients/") && pathname.endsWith("/edit")) return "Edit Client";
  if (pathname.startsWith("/clients/")) return "Client Details";
  if (pathname.startsWith("/clients")) return "Client Management";
  if (pathname.startsWith("/projects/new")) return "Create New Project";
  if (pathname.includes("/projects/") && pathname.endsWith("/edit")) return "Edit Project";
  if (pathname.startsWith("/projects/")) return "Project Workspace";
  if (pathname.startsWith("/projects")) return "Project Portfolio";
  if (pathname.startsWith("/tasks")) return "Tasks & Milestones";
  if (pathname.startsWith("/deliverables")) return "Deliverable Pipeline";
  if (pathname.startsWith("/payments")) return "Payments & Financials";
  if (pathname.startsWith("/reports")) return "Reports & Business Analytics";
  return "FreelanceFlow";
}

export default function Header({ onOpenSidebar }) {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-8 bg-cream border-b border-cream-border">
      {/* Left side: Hamburger button + Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="p-2 -ml-2 rounded-lg text-forest hover:bg-cream-dark lg:hidden focus:outline-none"
          aria-label="Open sidebar"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div>
          <h2 className="text-lg md:text-xl font-bold text-textColor-primary">
            {pageTitle}
          </h2>
        </div>
      </div>

      {/* Right side: Quick Action Buttons */}
      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          href="/clients/new"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg border border-forest text-forest bg-white hover:bg-cream-dark transition-colors"
        >
          <UserPlus className="w-4 h-4 text-forest" />
          <span className="hidden sm:inline">Add Client</span>
        </Link>

        <Link
          href="/projects/new"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg bg-forest text-white hover:bg-forest-light transition-colors shadow-sm"
        >
          <FolderPlus className="w-4 h-4 text-copper-light" />
          <span className="hidden sm:inline">New Project</span>
        </Link>
      </div>
    </header>
  );
}
