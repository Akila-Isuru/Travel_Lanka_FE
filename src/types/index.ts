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
