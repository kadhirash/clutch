"use client";

import { useState, useEffect } from "react";
import { PanicButton } from "./components/PanicButton";
import { ResultCard } from "./components/ResultCard";
import { ChatInterface } from "./components/ChatInterface";
import { LocationInput } from "./components/LocationInput";
import { VoiceInput } from "./components/VoiceInput";
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
  const [manualLocation, setManualLocation] = useState("");
  const [customQuery, setCustomQuery] = useState("");
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  // Get user location on mount
  useEffect(() => {
    handleDetectLocation();
  }, []);

  const handleDetectLocation = () => {
    if ("geolocation" in navigator) {
      setIsDetectingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setIsDetectingLocation(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsDetectingLocation(false);
        }
      );
    }
  };

  const handlePanicClick = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setAiMessage(null);

    try {
      // Create FormData for server action
      const formData = new FormData();

      // Use custom query if provided, otherwise default panic message
      const queryText = customQuery.trim()
        ? customQuery
        : "I need dinner right now! Find me a highly rated restaurant that's open now and nearby.";

      formData.append("query", queryText);

      if (chatId) {
        formData.append("chatId", chatId);
      }

      if (userLocation) {
        formData.append("latitude", userLocation.latitude.toString());
        formData.append("longitude", userLocation.longitude.toString());
      } else if (manualLocation.trim()) {
        formData.append("location", manualLocation);
      } else {
        setError("Please allow location access or enter your city manually.");
        setIsLoading(false);
        return;
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
    setCustomQuery(""); // Optional: clear query on reset
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
      <div className="flex-1 w-full flex flex-col items-center max-w-4xl mx-auto">
        {result ? (
          <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <ResultCard
              business={result}
              aiMessage={aiMessage || undefined}
              onReset={handleReset}
            />

            {/* Chat Interface for refinement */}
            <div className="w-full">
              <ChatInterface
                chatId={chatId}
                initialMessage={aiMessage || "I found this place for you. Want something else?"}
                userLocation={userLocation}
                onUpdateBusiness={(newBusiness: BusinessEntity) => {
                  setResult(newBusiness);
                  // Optional: scroll to top to see new card
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onUpdateChatId={(newChatId) => setChatId(newChatId)}
              />
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center gap-4 max-w-md mx-auto">
            <LocationInput
              value={manualLocation}
              onChange={setManualLocation}
              onDetectLocation={handleDetectLocation}
              isDetecting={isDetectingLocation}
            />

            <div className="relative w-full">
              <input
                type="text"
                value={customQuery}
                onChange={(e) => setCustomQuery(e.target.value)}
                placeholder="Any specific cravings? (Optional)"
                className="w-full bg-neutral-900/80 border border-border rounded-xl pl-4 pr-12 py-3 text-foreground placeholder:text-foreground/40 focus:ring-2 focus:ring-accent/50 outline-none backdrop-blur-sm transition-all text-center"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <VoiceInput
                  onTranscript={(text) => setCustomQuery(text)}
                  isProcessing={isLoading}
                />
              </div>
            </div>

            <PanicButton onClick={handlePanicClick} isLoading={isLoading} />
          </div>
        )}
      </div>

      {/* Footer */}
      {!result && (
        <div className="mt-12 text-center text-sm text-foreground/50">
          <p>Powered by Yelp AI</p>
          {!userLocation && !manualLocation && !isLoading && (
            <p className="mt-2 text-yellow-500/70">
              Enable location or enter city for results
            </p>
          )}
        </div>
      )}
    </main>
  );
}
