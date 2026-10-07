import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";

export const AbilityContext = createContext(null);

export const PROFILES = {
  default: {
    key: "default",
    name: "Standard",
    icon: "Sparkles",
    description: "Default balanced layout and natural speech speed.",
    fontSize: "medium",
    highContrast: false,
    speechSpeed: 1.0,
  },
  dyslexia: {
    key: "dyslexia",
    name: "Dyslexia Friendly",
    icon: "BookOpen",
    description: "Dyslexia-optimized typography, wide letter spacing, high line height.",
    fontSize: "large",
    highContrast: false,
    speechSpeed: 0.95,
  },
  "low-vision": {
    key: "low-vision",
    name: "Low Vision / High Contrast",
    icon: "Eye",
    description: "Max contrast black & bright yellow palette, large fonts, thick borders.",
    fontSize: "x-large",
    highContrast: true,
    speechSpeed: 0.9,
  },
  deaf: {
    key: "deaf",
    name: "Deaf & Hard-of-Hearing",
    icon: "VolumeX",
    description: "Visual notifications, real-time live captions, zero audio reliance.",
    fontSize: "medium",
    highContrast: false,
    speechSpeed: 1.0,
  },
  adhd: {
    key: "adhd",
    name: "Cognitive / ADHD",
    icon: "Brain",
    description: "Minimalist distraction-free layout, step-by-step chunks, reading ruler.",
    fontSize: "medium",
    highContrast: false,
    speechSpeed: 1.1,
  },
  elderly: {
    key: "elderly",
    name: "Elderly Friendly",
    icon: "HeartHandshake",
    description: "Extra large touch buttons, crystal clear labels, gentle paced voice.",
    fontSize: "large",
    highContrast: true,
    speechSpeed: 0.85,
  },
};

export function AbilityProfileProvider({ children }) {
  const { preferences, updatePrefs } = useAuth();

  const [currentProfile, setCurrentProfile] = useState("default");
  const [fontSize, setFontSize] = useState("medium"); // small, medium, large, x-large
  const [highContrast, setHighContrast] = useState(false);
  const [speechSpeed, setSpeechSpeed] = useState(1.0);
  const [preferredLanguage, setPreferredLanguage] = useState("English");
  const [readingRuler, setReadingRuler] = useState(false);
  const [rulerY, setRulerY] = useState(200);

  // Sync from user profile preferences when loaded
  useEffect(() => {
    if (preferences) {
      if (preferences.ability_profile && PROFILES[preferences.ability_profile]) {
        setCurrentProfile(preferences.ability_profile);
      }
      if (preferences.font_size) setFontSize(preferences.font_size);
      if (preferences.high_contrast !== undefined) setHighContrast(Boolean(preferences.high_contrast));
      if (preferences.speech_speed) setSpeechSpeed(Number(preferences.speech_speed));
      if (preferences.language) setPreferredLanguage(preferences.language);
    }
  }, [preferences]);

  // Apply DOM classes and CSS variables whenever preferences change
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    // Reset profile classes
    body.classList.remove(
      "profile-dyslexia",
      "profile-low-vision",
      "profile-deaf",
      "profile-adhd",
      "profile-elderly"
    );

    if (currentProfile !== "default") {
      body.classList.add(`profile-${currentProfile}`);
    }

    if (highContrast) {
      body.classList.add("theme-high-contrast");
    } else {
      body.classList.remove("theme-high-contrast");
    }

    // Set font scale
    const fontScales = {
      small: "0.875rem",
      medium: "1rem",
      large: "1.15rem",
      "x-large": "1.35rem",
    };
    root.style.setProperty("--font-scale", fontScales[fontSize] || "1rem");

    // Track mouse for ADHD reading ruler
    const handleMouseMove = (e) => {
      setRulerY(e.clientY);
    };
    if (readingRuler) {
      window.addEventListener("mousemove", handleMouseMove);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [currentProfile, fontSize, highContrast, readingRuler]);

  const selectProfile = (profileKey) => {
    const preset = PROFILES[profileKey] || PROFILES.default;
    setCurrentProfile(profileKey);
    setFontSize(preset.fontSize);
    setHighContrast(preset.highContrast);
    setSpeechSpeed(preset.speechSpeed);

    if (updatePrefs) {
      updatePrefs({
        ability_profile: profileKey,
        font_size: preset.fontSize,
        high_contrast: preset.highContrast,
        speech_speed: preset.speechSpeed,
      });
    }
  };

  const updateFontSize = (size) => {
    setFontSize(size);
    if (updatePrefs) updatePrefs({ font_size: size });
  };

  const updateHighContrast = (val) => {
    setHighContrast(val);
    if (updatePrefs) updatePrefs({ high_contrast: val });
  };

  const updateSpeechSpeed = (spd) => {
    setSpeechSpeed(spd);
    if (updatePrefs) updatePrefs({ speech_speed: spd });
  };

  const updatePreferredLanguage = (lang) => {
    setPreferredLanguage(lang);
    if (updatePrefs) updatePrefs({ language: lang });
  };

  return (
    <AbilityContext.Provider
      value={{
        currentProfile,
        profileConfig: PROFILES[currentProfile] || PROFILES.default,
        profilesList: Object.values(PROFILES),
        selectProfile,
        fontSize,
        setFontSize: updateFontSize,
        highContrast,
        setHighContrast: updateHighContrast,
        speechSpeed,
        setSpeechSpeed: updateSpeechSpeed,
        preferredLanguage,
        setPreferredLanguage: updatePreferredLanguage,
        readingRuler,
        setReadingRuler,
      }}
    >
      {children}
      {readingRuler && (
        <div
          aria-hidden="true"
          className="fixed left-0 right-0 pointer-events-none z-50 h-14 bg-amber-300/20 border-y-2 border-amber-400 shadow-lg backdrop-blur-[1px] transition-all duration-75"
          style={{ top: `${rulerY - 28}px` }}
        />
      )}
    </AbilityContext.Provider>
  );
}

export function useAbility() {
  const context = useContext(AbilityContext);
  if (!context) {
    throw new Error("useAbility must be used within an AbilityProfileProvider");
  }
  return context;
}
