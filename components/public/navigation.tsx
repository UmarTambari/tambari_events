"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, User, Ticket, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client"; // ← your provided client path

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    // Initial check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsSignedIn(!!session?.user);
    });

    // Listen for auth changes (real-time sync)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsSignedIn(!!session?.user);
    });

    // Cleanup listener
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/events", label: "Events" },
    ...(isSignedIn ? [{ href: "/my-tickets", label: "My Tickets" }] : []),
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Ticket className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">EventHub</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Auth Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {isSignedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Organizer Dashboard
                </Link>
                {/* Simple replacement for UserButton — can later extract to a dropdown if needed */}
                <div className="flex items-center space-x-3">
                  <Link
                    href="/profile"
                    className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <User className="inline h-5 w-5 mr-1" />
                    Profile
                  </Link>
                  <form action="/auth/signout" method="post">
                    <button
                      type="submit"
                      className="text-sm font-medium text-gray-700 hover:text-red-600 transition-colors flex items-center"
                    >
                      <LogOut className="inline h-4 w-4 mr-1" />
                      Sign Out
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                {link.label}
              </Link>
            ))}

            <div className="pt-4 border-t border-gray-200 space-y-3">
              {isSignedIn ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 text-gray-700 hover:text-blue-600 transition-colors font-medium"
                  >
                    Organizer Dashboard
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 text-gray-700 hover:text-blue-600 transition-colors font-medium"
                  >
                    Profile
                  </Link>
                  <form action="/auth/signout" method="post">
                    <button
                      type="submit"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full py-2 text-left text-gray-700 hover:text-red-600 transition-colors font-medium"
                    >
                      Sign Out
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link
                    href="/sign-in"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 text-center text-gray-700 hover:text-blue-600 transition-colors font-medium"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/sign-up"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 text-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}