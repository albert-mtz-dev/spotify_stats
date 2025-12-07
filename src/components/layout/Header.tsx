"use client";

import { signOut } from "next-auth/react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useSidebar } from "./SidebarContext";

interface HeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function Header({ user }: HeaderProps) {
  const { toggle } = useSidebar();

  return (
    <header className="sticky top-0 z-40 h-16 bg-bg-main/80 backdrop-blur-md border-b border-border-subtle">
      <div className="h-full px-4 lg:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Hamburger menu - only visible on mobile */}
          <motion.button
            onClick={toggle}
            className="lg:hidden p-2 -ml-2 text-text-secondary hover:text-text-primary transition-colors"
            whileTap={{ scale: 0.95 }}
            aria-label="Open menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </motion.button>
          <h1 className="text-lg lg:text-xl font-semibold text-text-primary">
            Your Music Profile
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <motion.button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Sign Out
          </motion.button>

          <div className="flex items-center gap-3">
            {user.image && (
              <Image
                src={user.image}
                alt={user.name || "User"}
                width={32}
                height={32}
                className="rounded-full"
              />
            )}
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-text-primary">
                {user.name}
              </p>
              <p className="text-xs text-text-secondary">{user.email}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
