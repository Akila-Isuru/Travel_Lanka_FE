export interface User {
  _id: string;
  name: string;
  email: string;
  roles: string[];
}

export interface Destination {
  _id: string;
  name: string;
  slug: string;
  description: string;
  location: string;
  category: string;
  pricePerNight: number;
  images: string[];
  createdAt: string;
  ratingsAverage?: number;
  ratingsQuantity?: number;
}

export interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
}

export interface Agent {
  _id: string;
  name: string;
  slug: string;
  photo: string;
  bio: string;
  specialties: string[];
  languages: string[];
  whatsappNumber: string;
  email: string;
  phone: string;
  pricePerDay: number;
  rating: number;
  reviewCount: number;
  destinations: string[] | Destination[];
  status: "active" | "inactive";
  yearsExperience: number;
  createdAt: string;
  updatedAt: string;
}

export interface AgentBooking {
  _id: string;
  agent: Agent | string;
  user: string | { _id: string; name: string; email: string };
  booking: string | null;
  destination: Destination | string;
  startDate: string;
  endDate: string;
  totalDays: number;
  agentFee: number;
  userPhone: string;
  userEmail: string;
  userName: string;
  status: "pending" | "confirmed" | "cancelled";
  whatsappSent: boolean;
  specialRequests: string;
  createdAt: string;
  updatedAt: string;
}

export interface AgentBookingInput {
  agentId: string;
  destinationId: string;
  startDate: string;
  endDate: string;
  guests: number;
  userPhone: string;
  specialRequests?: string;
  bookingId?: string;
}

export interface AgentWithAvailability extends Agent {
  available: boolean;
}

export interface Event {
  _id: string;
  name: string;
  slug: string;
  description: string;
  category:
    | "cultural"
    | "music"
    | "arts"
    | "food"
    | "nature"
    | "wellness"
    | "seasonal"
    | "sports"
    | "religious"
    | "other";
  subCategory?: string;
  startDate: string;
  endDate: string;
  isRecurring: boolean;
  recurringPattern?: "daily" | "weekly" | "monthly" | "yearly";
  location: string;
  address?: string;
  coordinates?: {
    type: string;
    coordinates: [number, number];
  };
  images: string[];
  coverImage: string;
  videoUrl?: string;
  organizer: string;
  organizerEmail: string;
  organizerPhone: string;
  website?: string;
  price: number;
  currency: "LKR" | "USD";
  isFree: boolean;
  maxCapacity: number;
  currentBookings: number;
  features: string[];
  status: "draft" | "published" | "upcoming" | "ongoing" | "past" | "cancelled";
  isPublished: boolean;
  destinationIds: string[] | Destination[];
  agentIds: string[] | Agent[];
  views: number;
  interestedCount: number;
  ratingsAverage: number;
  ratingsQuantity: number;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface EventBooking {
  _id: string;
  event: Event | string;
  user: string | { _id: string; name: string; email: string };
  tickets: number;
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled";
  // ===== FIX: added paymentStatus, used by AdminDashboard.tsx =====
  paymentStatus?: "pending" | "paid" | "failed";
  specialRequests?: string;
  bookingDate: string;
  paymentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventBookingInput {
  eventId: string;
  tickets: number;
  specialRequests?: string;
}

export interface EventCategory {
  category: string;
  count: number;
}
