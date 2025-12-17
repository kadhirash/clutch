"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Navigation } from "lucide-react";

interface LocationInputProps {
    value: string;
    onChange: (value: string) => void;
    onDetectLocation: () => void;
    isDetecting?: boolean;
}

export function LocationInput({ value, onChange, onDetectLocation, isDetecting = false }: LocationInputProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md mx-auto mb-8 relative z-20"
        >
            <div className="relative flex items-center">
                <MapPin className="absolute left-4 w-5 h-5 text-foreground/50" />

                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Enter City, State or Zip (e.g. New York)"
                    className="w-full bg-neutral-900/80 border border-border rounded-xl py-4 pl-12 pr-14 text-foreground placeholder:text-foreground/40 focus:ring-2 focus:ring-accent/50 outline-none backdrop-blur-sm transition-all shadow-lg"
                />

                <button
                    onClick={onDetectLocation}
                    disabled={isDetecting}
                    className="absolute right-2 p-2 hover:bg-neutral-800 rounded-lg text-accent transition-colors disabled:opacity-50"
                    title="Use my location"
                >
                    <Navigation className={`w-5 h-5 ${isDetecting ? "animate-pulse" : ""}`} />
                </button>
            </div>

            {!value && (
                <p className="text-xs text-center mt-2 text-foreground/40">
                    Or just click "Clutch" to use your current location
                </p>
            )}
        </motion.div>
    );
}
