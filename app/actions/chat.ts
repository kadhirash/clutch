"use server";

import { sendChatMessage, extractBusinessesFromResponse } from "@/app/lib/yelp/client";
import { BusinessEntity, UserContext } from "@/app/types/ai-chat";

export type ChatActionState = {
  message?: string;
  aiResponse?: string;
  businesses?: BusinessEntity[];
  chatId?: string;
  error?: string;
  shouldBook?: boolean;
};

export async function chatAction(
  prevState: ChatActionState,
  formData: FormData
): Promise<ChatActionState> {
  const query = formData.get("query") as string;
  const chatId = formData.get("chatId") as string | undefined;
  const location = formData.get("location") as string | undefined;
  const latitude = formData.get("latitude") as string | undefined;
  const longitude = formData.get("longitude") as string | undefined;

  if (!query || query.trim() === "") {
    return { error: "Please enter a message." };
  }

  try {
    // Build user context
    const userContext: UserContext = {
      locale: "en_US",
    };

    // Add location data if available
    if (latitude && longitude) {
      userContext.latitude = parseFloat(latitude);
      userContext.longitude = parseFloat(longitude);
    } else if (location) {
      userContext.location = location;
    }

    // If manual location is provided, append it to the query to ensure the AI knows about it
    let finalQuery = query;
    if (location && !latitude && !longitude) {
      finalQuery = `${query} near ${location}`;
    }

    // Send message to Yelp AI API
    const response = await sendChatMessage(
      finalQuery,
      chatId || undefined,
      userContext
    );

    // Extract businesses from response if any
    const businesses = extractBusinessesFromResponse(response);

    // Check for booking intent in the user's query
    // Check for booking intent in the user's query
    // Matches: "book", "reserve", "reservation", "table", "lets do 12pm", "how about 7", "party of 4", "schedule"
    const bookingKeywords = /\b(book|reserve|reservation|table|schedule|party of)\b|(\blets do\b)|(\bhow about\b)/i;
    const shouldBook = bookingKeywords.test(query);

    return {
      message: "Success",
      aiResponse: response.response.text,
      businesses: businesses.length > 0 ? businesses : undefined,
      chatId: response.chat_id,
      shouldBook, // Return the intent flag
    };
  } catch (err) {
    console.error("Chat Action Error:", err);
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return {
      error: `Failed to get response from Yelp AI: ${errorMessage}`,
    };
  }
}

