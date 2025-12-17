"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Star, MapPin, Navigation, Phone, DollarSign, Calendar } from "lucide-react";
import { BusinessEntity } from "@/app/types/ai-chat";
import Image from "next/image";
import { ReservationModal } from "./ReservationModal";

interface ResultCardProps {
  business: BusinessEntity;
  aiMessage?: string;
  onReset: () => void;
}

export function ResultCard({ business, aiMessage, onReset, isReservationOpen, onOpenReservation, onCloseReservation }: ResultCardProps & { isReservationOpen: boolean; onOpenReservation: () => void; onCloseReservation: () => void }) {

  const openInMaps = () => {
    const { latitude, longitude } = business.coordinates;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    window.open(url, "_blank");
  };

  const openYelpPage = () => {
    window.open(business.url, "_blank");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl mx-auto"
    >
      {/* AI Message */}
      {aiMessage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6 p-4 bg-card-bg border border-border rounded-lg"
        >
          <p className="text-foreground/90 text-center">{aiMessage}</p>
        </motion.div>
      )}

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="glass-card rounded-2xl overflow-hidden"
      >
        {/* Restaurant Image */}
        <div className="relative w-full h-64 md:h-80 bg-neutral-800 overflow-hidden group">
          <Image
            src={business.image_url}
            alt={business.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
        </div>

        {/* Restaurant Info */}
        <div className="p-6 space-y-4">
          {/* Name */}
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            {business.name}
          </h2>

          {/* Rating & Price */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
              <span className="font-semibold text-lg">{business.rating}</span>
              <span className="text-foreground/60">
                ({business.review_count} reviews)
              </span>
            </div>
            {business.price && (
              <div className="flex items-center gap-1 text-foreground/80">
                <DollarSign className="w-4 h-4" />
                <span className="font-medium">{business.price}</span>
              </div>
            )}
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {business.categories.slice(0, 3).map((cat) => (
              <span
                key={cat.alias}
                className="px-3 py-1 bg-neutral-800 rounded-full text-sm text-foreground/80"
              >
                {cat.title}
              </span>
            ))}
          </div>

          {/* Address */}
          <div className="flex items-start gap-2 text-foreground/70">
            <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <span>{business.location.display_address.join(", ")}</span>
          </div>

          {/* Phone */}
          {business.display_phone && (
            <div className="flex items-center gap-2 text-foreground/70">
              <Phone className="w-5 h-5" />
              <a
                href={`tel:${business.phone}`}
                className="hover:text-accent transition-colors"
              >
                {business.display_phone}
              </a>
            </div>
          )}

          {/* Distance */}
          {business.distance && (
            <div className="text-sm text-foreground/60">
              {(business.distance / 1609.34).toFixed(1)} miles away
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 space-y-3">
            {[
              { label: "Book a Table", icon: Calendar, onClick: onOpenReservation, primary: true },
              { label: "Navigate Now", icon: Navigation, onClick: openInMaps },
              { label: "View on Yelp", icon: null, onClick: openYelpPage },
              { label: "Find Another Place", icon: null, onClick: onReset, outline: true }
            ].map((btn, i) => (
              <motion.button
                key={btn.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + (i * 0.1) }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={btn.onClick}
                className={`w-full font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all ${btn.primary
                    ? "bg-accent hover:bg-accent-hover text-white shadow-lg shadow-accent/20"
                    : btn.outline
                      ? "bg-transparent border border-white/10 hover:bg-white/5 text-foreground/70 hover:text-foreground"
                      : "bg-white/5 hover:bg-white/10 text-white border border-white/5"
                  }`}
              >
                {btn.icon && <btn.icon className="w-5 h-5" />}
                {btn.label}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      <ReservationModal
        isOpen={isReservationOpen}
        onClose={onCloseReservation}
        restaurantName={business.name}
      />
    </motion.div>
  );
}
