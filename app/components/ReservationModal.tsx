"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Clock, Users, CheckCircle2 } from "lucide-react";

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurantName: string;
}

export function ReservationModal({ isOpen, onClose, restaurantName }: ReservationModalProps) {
  const [step, setStep] = useState<"form" | "success">("form");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setStep("success");
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card-bg border border-border rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between bg-neutral-900/50">
              <h3 className="font-semibold text-lg">
                {step === "form" ? "Book a Table" : "Reservation Confirmed"}
              </h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-neutral-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {step === "form" ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="text-sm text-foreground/70 mb-4">
                    Reserving at <span className="font-bold text-foreground">{restaurantName}</span>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-accent" /> Date
                    </label>
                    <input
                      type="date"
                      required
                      className="w-full bg-neutral-800 border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-accent/50 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Clock className="w-4 h-4 text-accent" /> Time
                      </label>
                      <input
                        type="time"
                        required
                        className="w-full bg-neutral-800 border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-accent/50 outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Users className="w-4 h-4 text-accent" /> Guests
                      </label>
                      <select
                        className="w-full bg-neutral-800 border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-accent/50 outline-none appearance-none"
                      >
                        {[2, 3, 4, 5, 6, 8].map(n => (
                          <option key={n} value={n}>{n} People</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isLoading}
                    className="w-full mt-6 bg-accent hover:bg-accent-hover text-white font-bold py-4 rounded-xl shadow-lg shadow-accent/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      "Checking Availability..."
                    ) : (
                      "Confirm Reservation"
                    )}
                  </motion.button>
                </form>
              ) : (
                <div className="text-center py-8 space-y-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto"
                  >
                    <CheckCircle2 className="w-10 h-10" />
                  </motion.div>
                  <div>
                    <h4 className="text-2xl font-bold mb-2">You're All Set!</h4>
                    <p className="text-foreground/70">
                      Your table at {restaurantName} has been reserved.
                    </p>
                  </div>
                  <div className="pt-4">
                    <button
                      onClick={onClose}
                      className="w-full bg-neutral-800 hover:bg-neutral-700 text-white font-medium py-3 rounded-xl transition-colors"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
