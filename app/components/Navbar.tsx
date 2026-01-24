"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, Mail, LogOut, LogIn } from "lucide-react";
import React from "react";
import { signOut, useSession } from "next-auth/react";

/* ----------------------------- Types ----------------------------- */

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
};

/* ----------------------------- Data ------------------------------ */

const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/", icon: Home },
  { label: "Orders", href: "/orders", icon: ShoppingBag },
  { label: "Contact", href: "/contact", icon: Mail },
];

/* ----------------------------- Component ------------------------- */

const Navbar: React.FC = () => {
  const pathname: string = usePathname();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: session, status } = useSession();

  const isActive = (href: string): boolean => pathname === href;

  const handleLogout = async (): Promise<void> => {
    await signOut({ callbackUrl: "/auth/login" });
  };

  return (
    <>
      {/* ---------------- Desktop Navbar ---------------- */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 z-50 bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto w-full px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 text-sm font-medium transition ${
                    isActive(item.href)
                      ? "text-stone-900"
                      : "text-stone-500 hover:text-stone-800"
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {status === "authenticated" ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm font-medium text-red-500 hover:text-red-600 transition"
            >
              <LogOut size={18} />
              Logout
            </button>
          ) : (
            <Link
              href="/auth/login"
              className="flex items-center gap-2 text-sm font-medium text-stone-500 hover:text-stone-800 transition"
            >
              <LogIn size={18} />
              Login
            </Link>
          )}
        </div>
      </nav>

      {/* ---------------- Mobile Bottom Navbar ---------------- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-stone-200">
        <div className="flex justify-around items-center py-3">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 text-xs transition ${
                  isActive(item.href) ? "text-stone-900" : "text-stone-400"
                }`}
              >
                <Icon size={20} />
                {item.label}
              </Link>
            );
          })}

          {status === "authenticated" ? (
            <button
              onClick={handleLogout}
              className="flex flex-col items-center gap-1 text-xs text-red-500"
            >
              <LogOut size={20} />
              Logout
            </button>
          ) : (
            <Link
              href="/auth/login"
              className="flex flex-col items-center gap-1 text-xs text-stone-500"
            >
              <LogIn size={20} />
              Login
            </Link>
          )}
        </div>
      </nav>

      {/* Spacer so content isn't hidden */}
      <div className="h-0 md:h-20" />
    </>
  );
};

export default Navbar;
