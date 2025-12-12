"use client";

import { useState, useEffect } from "react";
import { PanicButton } from "./components/PanicButton";
import { ResultCard } from "./components/ResultCard";
import { chatAction, ChatActionState } from "./actions/chat";
import { BusinessEntity } from "./types/ai-chat";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<BusinessEntity | null>(null);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [chatId, setChatId] = useState<string | undefined>(undefined);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // Get user location on mount
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          // Continue without location - Yelp AI can still work
        }
      );
    }
  }, []);

  const handlePanicClick = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setAiMessage(null);

    try {
      // Create FormData for server action
      const formData = new FormData();
      formData.append(
        "query",
        "I need dinner right now! Find me a highly rated restaurant that's open now and nearby."
      );

      if (chatId) {
        formData.append("chatId", chatId);
      }

      if (userLocation) {
        formData.append("latitude", userLocation.latitude.toString());
        formData.append("longitude", userLocation.longitude.toString());
      }

      // Call server action
      const state: ChatActionState = await chatAction(
        {} as ChatActionState,
        formData
      );

      if (state.error) {
        setError(state.error);
        return;
      }

      if (state.businesses && state.businesses.length > 0) {
        // Get the first (best) result
        setResult(state.businesses[0]);
        setAiMessage(state.aiResponse || null);
        setChatId(state.chatId);
      } else if (state.aiResponse) {
        // AI responded but no businesses found
        setError(state.aiResponse);
      } else {
        setError("No restaurants found. Please try again.");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setAiMessage(null);
    setError(null);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
      {/* Header */}
      {!result && (
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground">
            CLUTCH
          </h1>
          <p className="text-lg md:text-xl text-foreground/70 max-w-md mx-auto">
            Emergency dinner reservations.
            <br />
            <span className="text-accent font-semibold">
              One click. We decide.
            </span>
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && !result && (
        <div className="mb-8 p-4 bg-red-900/20 border border-red-500/50 rounded-lg max-w-md text-center">
          <p className="text-red-200">{error}</p>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center w-full">
        {result ? (
          <ResultCard
            business={result}
            aiMessage={aiMessage || undefined}
            onReset={handleReset}
          />
        ) : (
          <PanicButton onClick={handlePanicClick} isLoading={isLoading} />
        )}
      </div>

      {/* Footer */}
      {!result && (
        <div className="mt-12 text-center text-sm text-foreground/50">
          <p>Powered by Yelp AI</p>
          {!userLocation && !isLoading && (
            <p className="mt-2 text-yellow-500/70">
              Enable location for better results
            </p>
          )}
        </div>
      )}
    </main>
  );
}
