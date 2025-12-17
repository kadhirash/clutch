"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Loader2 } from "lucide-react";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  isProcessing?: boolean;
  disabled?: boolean;
}

export function VoiceInput({ onTranscript, isProcessing = false, disabled = false }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // @ts-ignore - WebkitSpeechRecognition is not in standard types
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = false;
        recognitionInstance.lang = "en-US";

        recognitionInstance.onstart = () => setIsListening(true);
        recognitionInstance.onend = () => setIsListening(false);
        recognitionInstance.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
        };
        recognitionInstance.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            onTranscript(transcript);
          }
        };

        setRecognition(recognitionInstance);
        setIsSupported(true);
      }
    }
  }, [onTranscript]);

  const toggleListening = useCallback(() => {
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
    } else {
      try {
        recognition.start();
      } catch (e) {
        console.error("Failed to start recognition", e);
      }
    }
  }, [isListening, recognition]);

  if (!isSupported) return null;

  return (
    <div className="relative">
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.5, opacity: 0.2 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0 bg-accent rounded-full"
          />
        )}
      </AnimatePresence>
      
      <motion.button
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
        onClick={toggleListening}
        disabled={disabled || isProcessing}
        className={`
          relative z-10 p-3 rounded-full transition-colors shadow-lg
          ${isListening 
            ? "bg-accent text-white" 
            : "bg-neutral-800 text-foreground/70 hover:text-foreground hover:bg-neutral-700 border border-border"
          }
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
        title="Use voice input"
      >
        {isProcessing ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : isListening ? (
          <MicOff className="w-5 h-5" />
        ) : (
          <Mic className="w-5 h-5" />
        )}
      </motion.button>
    </div>
  );
}
