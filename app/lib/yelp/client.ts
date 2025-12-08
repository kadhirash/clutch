import { ChatRequest, ChatResponse, UserContext } from "@/app/types/ai-chat";

const YELP_API_KEY = process.env.YELP_API_KEY;
const YELP_AI_API_BASE = "https://api.yelp.com/ai/chat/v2";

export class YelpApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "YelpApiError";
  }
}

/**
 * Send a message to Yelp AI Chat API
 * @param query - Natural language query from the user
 * @param chatId - Optional chat ID for continuing a conversation
 * @param userContext - Optional user context (location, locale)
 * @returns ChatResponse with AI text and structured business data
 */
export async function sendChatMessage(
  query: string,
  chatId?: string,
  userContext?: UserContext
): Promise<ChatResponse> {
  if (!YELP_API_KEY) {
    throw new Error("Missing Yelp API Key");
  }

  if (!query || query.trim() === "") {
    throw new Error("Query cannot be empty");
  }

  const requestBody: ChatRequest = {
    query: query.trim(),
  };

  // Add chat_id if continuing a conversation
  if (chatId) {
    requestBody.chat_id = chatId;
  }

  // Add user context if provided
  if (userContext) {
    requestBody.user_context = userContext;
  }

  try {
    const res = await fetch(YELP_AI_API_BASE, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${YELP_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
      cache: "no-store",
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new YelpApiError(
        res.status,
        `Yelp AI API request failed: ${res.statusText} - ${errorText}`
      );
    }

    const data = await res.json();

    // Validate response structure
    if (!data.response || !data.response.text) {
      throw new Error("Invalid response format from Yelp AI API");
    }

    if (!data.chat_id) {
      throw new Error("Missing chat_id in response");
    }

    return data as ChatResponse;
  } catch (error) {
    if (error instanceof YelpApiError || error instanceof Error) {
      throw error;
    }
    throw new Error("Unknown error occurred while fetching from Yelp AI API");
  }
}

/**
 * Helper function to extract businesses from chat response
 */
export function extractBusinessesFromResponse(response: ChatResponse) {
  if (!response.entities || response.entities.length === 0) {
    return [];
  }

  const businessEntities = response.entities.find(
    (entity) => entity.type === "business" && entity.businesses
  );

  return businessEntities?.businesses || [];
}
