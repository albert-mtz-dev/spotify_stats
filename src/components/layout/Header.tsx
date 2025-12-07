"use client";

import { signOut } from "next-auth/react";
import Image from "next/image";
import { motion } from "framer-motion";

interface HeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function Header({ user }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 h-16 bg-bg-main/80 backdrop-blur-md border-b border-border-subtle">
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-text-primary">
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
