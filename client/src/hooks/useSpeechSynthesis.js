import { useState, useEffect, useRef, useCallback } from "react";
import { useAbility } from "../components/AbilityProfileProvider.jsx";

export function useSpeechSynthesis() {
  const { speechSpeed, preferredLanguage } = useAbility();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [availableVoices, setAvailableVoices] = useState([]);
  const utteranceRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const updateVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const stop = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentWordIndex(-1);
  }, []);

  const pause = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  }, []);

  const resume = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
    }
  }, []);

  const speak = useCallback(
    (text, customRate = null) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        alert("Speech synthesis is not supported on this browser.");
        return;
      }

      stop();
      if (!text || text.trim() === "") return;

      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;

      utterance.rate = customRate || speechSpeed || 1.0;

      // Select voice based on preferredLanguage
      const langCodes = {
        Telugu: "te-IN",
        Hindi: "hi-IN",
        Tamil: "ta-IN",
        Kannada: "kn-IN",
        Malayalam: "ml-IN",
        English: "en-US",
      };
      const targetLangCode = langCodes[preferredLanguage] || "en-US";
      utterance.lang = targetLangCode;

      const matchedVoice = availableVoices.find(
        (v) => v.lang.startsWith(targetLangCode.split("-")[0]) || v.lang === targetLangCode
      );
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      // Word boundary event for synchronized highlighting
      utterance.onboundary = (event) => {
        if (event.name === "word") {
          const charIndex = event.charIndex;
          const textBefore = text.slice(0, charIndex);
          const wordsBefore = textBefore.trim().split(/\s+/).filter(Boolean);
          setCurrentWordIndex(wordsBefore.length);
        }
      };

      utterance.onstart = () => {
        setIsPlaying(true);
        setIsPaused(false);
      };

      utterance.onend = () => {
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentWordIndex(-1);
      };

      utterance.onerror = () => {
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentWordIndex(-1);
      };

      window.speechSynthesis.speak(utterance);
    },
    [stop, speechSpeed, preferredLanguage, availableVoices]
  );

  return {
    isPlaying,
    isPaused,
    currentWordIndex,
    speak,
    pause,
    resume,
    stop,
    availableVoices,
  };
}
