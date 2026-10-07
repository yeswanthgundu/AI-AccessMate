import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { WifiOff } from "lucide-react";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { AbilityProfileProvider } from "./components/AbilityProfileProvider.jsx";
import { Navbar } from "./components/Navbar.jsx";
import { VoiceCommandListener } from "./components/VoiceCommandListener.jsx";

// Pages
import { Dashboard } from "./pages/Dashboard.jsx";
import { TextSimplifier } from "./pages/TextSimplifier.jsx";
import { Translator } from "./pages/Translator.jsx";
import { SnapUnderstand } from "./pages/SnapUnderstand.jsx";
import { DocumentNavigator } from "./pages/DocumentNavigator.jsx";
import { ScamGuard } from "./pages/ScamGuard.jsx";
import { ConversationMode } from "./pages/ConversationMode.jsx";
import { LectureHelper } from "./pages/LectureHelper.jsx";
import { AccessibilityChecker } from "./pages/AccessibilityChecker.jsx";
import { UrlSimplifier } from "./pages/UrlSimplifier.jsx";
import { Settings } from "./pages/Settings.jsx";
import { History } from "./pages/History.jsx";
import { Login } from "./pages/Login.jsx";
import { Register } from "./pages/Register.jsx";

export function App() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <AuthProvider>
      <AbilityProfileProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 transition-colors">
            {/* Low-Bandwidth / Offline Mode Banner */}
            {isOffline && (
              <div
                role="status"
                aria-live="polite"
                className="bg-amber-500 text-slate-950 px-4 py-2 text-center text-xs font-bold flex items-center justify-center gap-2 z-50 sticky top-0"
              >
                <WifiOff className="w-4 h-4" />
                <span>
                  You are offline. AI AccessMate PWA is operating in local cached mode.
                </span>
              </div>
            )}

            {/* Navigation */}
            <Navbar />

            {/* Main Application Content Container */}
            <main id="main-content" tabIndex="-1" className="flex-1 focus:outline-none">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/simplifier" element={<TextSimplifier />} />
                <Route path="/translator" element={<Translator />} />
                <Route path="/snap" element={<SnapUnderstand />} />
                <Route path="/documents" element={<DocumentNavigator />} />
                <Route path="/scam-guard" element={<ScamGuard />} />
                <Route path="/conversation" element={<ConversationMode />} />
                <Route path="/lecture" element={<LectureHelper />} />
                <Route path="/accessibility-checker" element={<AccessibilityChecker />} />
                <Route path="/url" element={<UrlSimplifier />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/history" element={<History />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </main>

            {/* Global Voice Command Assistant */}
            <VoiceCommandListener />
          </div>
        </BrowserRouter>
      </AbilityProfileProvider>
    </AuthProvider>
  );
}

export default App;
