import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  Sparkles,
  Eye,
  Sliders,
  History,
  ShieldAlert,
  FileText,
  Camera,
  Languages,
  BookOpen,
  Headphones,
  CheckSquare,
  LogOut,
  User,
  Compass,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useAbility } from "./AbilityProfileProvider.jsx";

export function Navbar() {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const {
    currentProfile,
    selectProfile,
    profilesList,
    readingRuler,
    setReadingRuler,
    highContrast,
    setHighContrast,
  } = useAbility();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const navLinks = [
    { name: "Dashboard", to: "/dashboard", icon: Compass },
    { name: "Simplifier", to: "/simplifier", icon: Sparkles },
    { name: "Translator", to: "/translator", icon: Languages },
    { name: "Snap & Vision", to: "/snap", icon: Camera },
    { name: "Documents", to: "/documents", icon: FileText },
    { name: "Scam Guard", to: "/scam-guard", icon: ShieldAlert },
    { name: "Lecture Helper", to: "/lecture", icon: BookOpen },
    { name: "Live Captions", to: "/conversation", icon: Headphones },
    { name: "Audit Tool", to: "/accessibility-checker", icon: CheckSquare },
  ];

  return (
    <>
      {/* WCAG Skip to Main Content Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-amber-400 focus:text-slate-950 focus:font-extrabold focus:rounded-md focus:shadow-2xl focus:outline-none"
      >
        Skip to main content
      </a>

      <header
        role="banner"
        className="sticky top-0 z-40 bg-slate-950/90 border-b border-slate-800 backdrop-blur-md transition-colors"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Link
                to="/dashboard"
                aria-label="AI AccessMate Homepage"
                className="flex items-center gap-2.5 group focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-400 rounded-xl p-1"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform">
                  <Sparkles className="w-6 h-6 fill-white/20" aria-hidden="true" />
                </div>
                <div>
                  <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
                    AI AccessMate
                    <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-indigo-950 text-indigo-300 border border-indigo-700">
                      MVP
                    </span>
                  </span>
                  <span className="text-[11px] text-slate-400 block -mt-0.5 font-medium">
                    See it. Understand it. Act on it.
                  </span>
                </div>
              </Link>
            </div>

            {/* Middle Quick Accessibility Switches */}
            <div className="hidden lg:flex items-center gap-2 bg-slate-900/80 border border-slate-800 p-1.5 rounded-2xl">
              {/* Profile Selector */}
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  aria-expanded={profileDropdownOpen}
                  aria-label="Select one-tap ability profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-400"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span className="capitalize">
                    Profile: {profilesList.find((p) => p.key === currentProfile)?.name || "Standard"}
                  </span>
                </button>

                {profileDropdownOpen && (
                  <div
                    role="menu"
                    className="absolute left-0 mt-2 w-64 bg-slate-900 border-2 border-slate-700 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in duration-150 card-contrast"
                  >
                    <div className="px-3 py-2 border-b border-slate-800 mb-1">
                      <p className="text-xs font-bold text-slate-200">One-Tap Ability Profiles</p>
                      <p className="text-[11px] text-slate-400">Instantly adapts typography, speed & UI</p>
                    </div>
                    {profilesList.map((prof) => (
                      <button
                        key={prof.key}
                        role="menuitem"
                        onClick={() => {
                          selectProfile(prof.key);
                          setProfileDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs flex flex-col transition ${
                          currentProfile === prof.key
                            ? "bg-indigo-600 text-white font-bold"
                            : "text-slate-300 hover:bg-slate-800"
                        }`}
                      >
                        <span className="font-semibold">{prof.name}</span>
                        <span className={`text-[10px] mt-0.5 line-clamp-1 ${
                          currentProfile === prof.key ? "text-indigo-100" : "text-slate-400"
                        }`}>
                          {prof.description}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Reading Ruler Toggle */}
              <button
                onClick={() => setReadingRuler(!readingRuler)}
                aria-pressed={readingRuler}
                aria-label="Toggle ADHD focus reading ruler overlay"
                className={`px-2.5 py-1.5 rounded-xl text-xs font-medium transition border ${
                  readingRuler
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold"
                    : "text-slate-400 border-transparent hover:text-slate-200"
                }`}
                title="Reading Ruler helps maintain focus by tracking your cursor"
              >
                Reading Ruler
              </button>

              {/* High Contrast Toggle */}
              <button
                onClick={() => setHighContrast(!highContrast)}
                aria-pressed={highContrast}
                aria-label="Toggle High Contrast Display Mode"
                className={`px-2.5 py-1.5 rounded-xl text-xs font-medium transition border ${
                  highContrast
                    ? "bg-yellow-400 text-black font-extrabold border-yellow-300"
                    : "text-slate-400 border-transparent hover:text-slate-200"
                }`}
              >
                Contrast
              </button>
            </div>

            {/* Right Desktop Nav Links & User */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                to="/history"
                aria-label="View history"
                className={`p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition ${
                  location.pathname === "/history" ? "bg-slate-800 text-white" : ""
                }`}
                title="Interaction History"
              >
                <History className="w-5 h-5" />
              </Link>

              <Link
                to="/settings"
                aria-label="Accessibility Settings"
                className={`p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition ${
                  location.pathname === "/settings" ? "bg-slate-800 text-white" : ""
                }`}
                title="Settings & Font Controls"
              >
                <Sliders className="w-5 h-5" />
              </Link>

              {isAuthenticated ? (
                <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                  <span className="text-xs font-medium text-slate-300 max-w-[120px] truncate">
                    {user?.name || "User"}
                  </span>
                  <button
                    onClick={logout}
                    aria-label="Log out"
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition shadow-md shadow-indigo-600/20"
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={mobileMenuOpen}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-400"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <nav
            role="navigation"
            aria-label="Mobile Navigation"
            className="md:hidden border-t border-slate-800 bg-slate-950 px-4 pt-3 pb-6 space-y-3"
          >
            {/* Quick Profile Selection on Mobile */}
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
              <label htmlFor="mobile-profile" className="block text-xs font-bold text-slate-300 mb-1.5">
                Ability Profile:
              </label>
              <select
                id="mobile-profile"
                value={currentProfile}
                onChange={(e) => selectProfile(e.target.value)}
                className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white"
              >
                {profilesList.map((p) => (
                  <option key={p.key} value={p.key}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl text-xs font-semibold transition ${
                      isActive
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-900 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <Link
                to="/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs font-medium text-slate-300 hover:text-white"
              >
                Settings & Preferences
              </Link>
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs text-rose-400 font-semibold"
                >
                  Log Out
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-xs text-indigo-400 font-semibold"
                >
                  Sign In
                </Link>
              )}
            </div>
          </nav>
        )}
      </header>
    </>
  );
}
