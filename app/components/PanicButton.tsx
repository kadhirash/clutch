"use client";

import { motion } from "framer-motion";
import { Loader2, Sparkles } from "lucide-react";

interface PanicButtonProps {
  onClick: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

export function PanicButton({ onClick, isLoading, disabled }: PanicButtonProps) {
  return (
    <div className="relative flex items-center justify-center w-full">
      {/* Glow effect */}
      {!disabled && (
        <motion.div
          className="absolute -inset-6 sm:-inset-4 bg-accent/20 rounded-full blur-2xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}

      {/* Main button */}
      <motion.button
        onClick={onClick}
        disabled={isLoading || disabled}
        className={`
          relative z-10
          w-[min(18rem,80vw)] h-[min(18rem,80vw)] sm:w-72 sm:h-72 md:w-80 md:h-80
          rounded-full
          bg-gradient-to-br from-accent to-accent-hover
          text-white
          font-bold text-2xl sm:text-3xl
          shadow-2xl
          transition-all duration-200
          ${!disabled && !isLoading ? "hover:scale-105 active:scale-95" : ""}
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          ${isLoading ? "cursor-wait" : ""}
        `}
        whileTap={!disabled && !isLoading ? { scale: 0.95 } : {}}
        whileHover={!disabled && !isLoading ? { scale: 1.05 } : {}}
      >
        <div className="flex flex-col items-center justify-center gap-4">
          {isLoading ? (
            <>
              <Loader2 className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 animate-spin" />
              <span className="text-xl sm:text-2xl">Finding...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16" />
              <span>CLUTCH</span>
              <span className="text-sm md:text-base font-normal opacity-90">
                Emergency Finder
              </span>
            </>
          )}
        </div>
      </motion.button >
    </div >
  );
}
