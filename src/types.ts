export type UserRole = "buyer" | "seller" | "broker" | "admin";

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  bio: string | null;
  created_at: string;
}

export interface Listing {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  revenue_range: string;
  category: string;
  images: string[];
  documents: string[];
  is_active: boolean;
  created_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  listing_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}
