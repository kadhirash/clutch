"use server";

import { searchBusiness } from "@/app/lib/yelp/client";
import { YelpBusiness } from "@/app/types/yelp";

export type ActionState = {
  message?: string;
  data?: YelpBusiness;
  error?: string;
};

export async function findDinnerAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const location = formData.get("location") as string;
  
  if (!location || location.trim() === "") {
    return { error: "Please enter a valid location." };
  }
  
  try {
    // 1. Search for open businesses
    // We search for "dinner" specifically, open now
    const results = await searchBusiness("dinner", location, true);
    
    if (!results.businesses || results.businesses.length === 0) {
      return { error: "No open restaurants found near you. Try a different location." };
    }

    // 2. Simple "Agent" Logic: Pick the best candidate
    // Criteria: Rating >= 4.0, > 10 reviews
    const candidates = results.businesses.filter(b => b.rating >= 4.0 && b.review_count > 10);
    
    // If no "perfect" candidates, fallback to the best available result
    const winner = candidates.length > 0 ? candidates[0] : results.businesses[0];

    return { 
      message: "Found a spot!", 
      data: winner 
    };

  } catch (err) {
    console.error("Action Error:", err);
    return { error: "Failed to contact Yelp Agent. Please try again." };
  }
}
