"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            // @ts-ignore - WebkitSpeechRecognition is not in standard types
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            setIsSupported(!!SpeechRecognition);
        }
    }, []);

    const startListening = useCallback(() => {
        // @ts-ignore - WebkitSpeechRecognition is not in standard types
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-US";

        recognition.onstart = () => {
            console.log("Recognition started");
            setIsListening(true);
        };

        recognition.onend = () => {
            console.log("Recognition ended");
            setIsListening(false);
            recognitionRef.current = null; // Cleanup on end
        };

        recognition.onerror = (event: any) => {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
            recognitionRef.current = null;
        };

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            console.log("Transcript received:", transcript);
            if (transcript) {
                onTranscript(transcript);
            }
        };

        recognitionRef.current = recognition;
        try {
            recognition.start();
        } catch (e) {
            console.error("Failed to start recognition", e);
        }
    }, [onTranscript]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            console.log("Stopping recognition...");
            recognitionRef.current.stop();
        }
    }, []);

    const toggleListening = useCallback(() => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    }, [isListening, startListening, stopListening]);

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
                type="button"
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
