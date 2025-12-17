"use client";

import { useState, useEffect } from "react";
import { PanicButton } from "./components/PanicButton";
import { ResultCard } from "./components/ResultCard";
import { ChatInterface } from "./components/ChatInterface";
import { LocationInput } from "./components/LocationInput";
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
  const [isReservationOpen, setIsReservationOpen] = useState(false);

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
          setManualLocation(""); // Clear manual input when using GPS
          setIsDetectingLocation(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsDetectingLocation(false);
        }
      );
    }
  };

  const handleClearLocation = () => {
    setUserLocation(null);
    setManualLocation("");
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
        : "Find me a highly rated spot nearby that's open now.";

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
        // AI responded but no businesses found (e.g. asking for clarification)
        setAiMessage(state.aiResponse);
        setChatId(state.chatId);
        // CRITICAL FIX: Do NOT clear result here if we already have one.
        // This ensures the "Book a Table" button stays visible during conversation.
        if (!result) {
          setResult(null);
        }
        // Check for booking intent from the server
        if (state.shouldBook) {
          setIsReservationOpen(true);
        }
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
    setChatId(undefined); // Reset chat ID
    setCustomQuery(""); // Optional: clear query on reset
  };

  return (
    <main
      className={`min-h-[100dvh] flex flex-col items-center p-4 md:p-8 relative overflow-hidden ${result || chatId ? "justify-start pt-6 md:pt-10" : "justify-center"
        }`}
    >
      {/* Background Gradient Blob */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-accent/20 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none z-0" />

      {/* Header */}
      {!result && !chatId && (
        <div className="text-center mb-10 md:mb-12 space-y-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground">
            CLUTCH
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-foreground/70 max-w-md mx-auto">
            Emergency concierge.
            <br />
            <span className="text-accent font-semibold">
              One click. We decide.
            </span>
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && !result && !chatId && (
        <div className="mb-8 p-4 bg-red-900/20 border border-red-500/50 rounded-lg max-w-md text-center">
          <p className="text-red-200">{error}</p>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 w-full flex flex-col items-center max-w-4xl mx-auto">
        {(result || chatId) ? (
          <div className="w-full space-y-5 md:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {result && (
              <ResultCard
                business={result}
                aiMessage={aiMessage || undefined}
                onReset={handleReset}
                isReservationOpen={isReservationOpen}
                onOpenReservation={() => setIsReservationOpen(true)}
                onCloseReservation={() => setIsReservationOpen(false)}
              />
            )}

            {/* Chat Interface for refinement */}
            <div className="w-full pb-6 md:pb-0">
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

            {/* Show reset button if only chatting without result */}
            {!result && (
              <button
                onClick={handleReset}
                className="mx-auto block text-sm text-foreground/50 hover:text-foreground transition-colors"
              >
                Start Over
              </button>
            )}
          </div>
        ) : (
          <div className="w-full flex flex-col items-center gap-4 max-w-md mx-auto">
            <LocationInput
              value={manualLocation}
              onChange={setManualLocation}
              onDetectLocation={handleDetectLocation}
              isDetecting={isDetectingLocation}
              isUsingCurrentLocation={!!userLocation}
              onClear={handleClearLocation}
            />

            <div className="relative w-full">
              <input
                type="text"
                value={customQuery}
                onChange={(e) => setCustomQuery(e.target.value)}
                placeholder="Any specific cravings? (Optional)"
                className="w-full glass-input rounded-xl px-4 py-3.5 sm:py-4 focus:outline-none focus:ring-1 focus:ring-accent/50 transition-all shadow-lg"
              />
            </div>

            <PanicButton onClick={handlePanicClick} isLoading={isLoading} />
          </div>
        )}
      </div>

      {/* Footer */}
      {!result && !chatId && (
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
