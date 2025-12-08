// Yelp AI Chat API Types
// Based on: https://docs.developer.yelp.com/docs/yelp-fusion-ai-api

export interface ChatRequest {
  query: string;
  chat_id?: string;
  user_context?: UserContext;
}

export interface UserContext {
  locale?: string;
  latitude?: number;
  longitude?: number;
  location?: string; // Alternative to lat/long
}

export interface ChatResponse {
  response: {
    text: string;
  };
  types: string[];
  entities?: Entity[];
  chat_id: string;
}

export interface Entity {
  type: string;
  businesses?: BusinessEntity[];
}

export interface BusinessEntity {
  id: string;
  alias: string;
  name: string;
  image_url: string;
  is_closed: boolean;
  url: string;
  review_count: number;
  categories: Category[];
  rating: number;
  coordinates: Coordinates;
  transactions: string[];
  price?: string;
  location: Location;
  phone: string;
  display_phone: string;
  distance?: number;
  contextual_info?: ContextualInfo;
  summaries?: BusinessSummaries;
  review_snippet?: ReviewSnippet;
}

export interface Category {
  alias: string;
  title: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Location {
  address1: string;
  address2?: string;
  address3?: string;
  city: string;
  zip_code: string;
  country: string;
  state: string;
  display_address: string[];
}

export interface ContextualInfo {
  summary?: string;
}

export interface BusinessSummaries {
  short?: string;
  medium?: string;
  long?: string;
}

export interface ReviewSnippet {
  text: string;
  rating?: number;
  user_name?: string;
}

// Chat session management
export interface ChatSession {
  chat_id: string;
  messages: ChatMessage[];
  user_context?: UserContext;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  businesses?: BusinessEntity[];
}
