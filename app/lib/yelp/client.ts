import { YelpSearchResponse } from "@/app/types/yelp";

const YELP_API_KEY = process.env.YELP_API_KEY;
const YELP_API_BASE = "https://api.yelp.com/v3"; 

export class YelpApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "YelpApiError";
  }
}

export async function searchBusiness(
  term: string, 
  location: string, 
  open_now: boolean = true, 
  radius: number = 2000
): Promise<YelpSearchResponse> {
  if (!YELP_API_KEY) {
    throw new Error("Missing Yelp API Key");
  }

  const params = new URLSearchParams({
    term,
    location,
    radius: radius.toString(),
    sort_by: "best_match",
    limit: "5",
  });

  if (open_now) {
    params.append("open_now", "true");
  }

  try {
    const res = await fetch(`${YELP_API_BASE}/businesses/search?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${YELP_API_KEY}`,
        "Content-Type": "application/json",
      },
      next: { revalidate: 0 }
    });

    if (!res.ok) {
      throw new YelpApiError(res.status, `Yelp API request failed: ${res.statusText}`);
    }

    const data = await res.json();
    
    if (!data.businesses || !Array.isArray(data.businesses)) {
      throw new Error("Invalid response format from Yelp API");
    }

    return data as YelpSearchResponse;

  } catch (error) {
    if (error instanceof YelpApiError || error instanceof Error) {
      throw error;
    }
    throw new Error("Unknown error occurred while fetching from Yelp");
  }
}
