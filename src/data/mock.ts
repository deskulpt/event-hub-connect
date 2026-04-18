export type EventType = "meetup" | "birthday" | "formal" | "athome";

export const EVENT_TYPES: { id: EventType; label: string; emoji: string; hint: string }[] = [
  { id: "meetup", label: "Casual meetup", emoji: "☕", hint: "2–10 people" },
  { id: "birthday", label: "Birthday & party", emoji: "🎉", hint: "10–80 people" },
  { id: "formal", label: "Wedding · Conference", emoji: "💍", hint: "80–500+ people" },
  { id: "athome", label: "At-home experience", emoji: "🏡", hint: "Artists & chefs to you" },
];

export type Venue = {
  id: string;
  name: string;
  city: string;
  capacity: number;
  rating?: number;
  reviewCount: number;
  priceLevel: 1 | 2 | 3 | 4;
  image: string;
  tags: string[];
};

export type Pro = {
  id: string;
  name: string;
  category: string;
  city: string;
  priceFrom: number;
  rating?: number;
  reviewCount: number;
  image: string;
  verified: boolean;
};

export const MOCK_VENUES: Venue[] = [
  {
    id: "v1",
    name: "The Garden Loft",
    city: "Lisbon",
    capacity: 60,
    rating: 4.8,
    reviewCount: 24,
    priceLevel: 3,
    image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=900&auto=format&fit=crop",
    tags: ["Rooftop", "Private dining"],
  },
  {
    id: "v2",
    name: "Maison Lumière",
    city: "Paris",
    capacity: 200,
    rating: 4.9,
    reviewCount: 88,
    priceLevel: 4,
    image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=900&auto=format&fit=crop",
    tags: ["Wedding venue", "Ballroom"],
  },
  {
    id: "v3",
    name: "Brew & Co.",
    city: "Lisbon",
    capacity: 12,
    reviewCount: 0,
    priceLevel: 1,
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=900&auto=format&fit=crop",
    tags: ["Café", "Intimate"],
  },
];

export const MOCK_PROS: Pro[] = [
  {
    id: "p1",
    name: "Léa Moreau",
    category: "Violinist",
    city: "Paris",
    priceFrom: 220,
    rating: 5.0,
    reviewCount: 12,
    image: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=900&auto=format&fit=crop",
    verified: true,
  },
  {
    id: "p2",
    name: "Chef Arjun",
    category: "Private chef · Indian cuisine",
    city: "Lisbon",
    priceFrom: 65,
    reviewCount: 2,
    image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=900&auto=format&fit=crop",
    verified: true,
  },
  {
    id: "p3",
    name: "Wine & Brush by Mara",
    category: "Wine & paint host",
    city: "Lisbon",
    priceFrom: 40,
    rating: 4.7,
    reviewCount: 18,
    image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=900&auto=format&fit=crop",
    verified: true,
  },
];

export const MOCK_CATERERS: Pro[] = [
  {
    id: "c1",
    name: "Olive & Fig Catering",
    category: "Mediterranean",
    city: "Lisbon",
    priceFrom: 28,
    rating: 4.6,
    reviewCount: 31,
    image: "https://images.unsplash.com/photo-1555244162-803834f70033?w=900&auto=format&fit=crop",
    verified: true,
  },
  {
    id: "c2",
    name: "Sakura Bites",
    category: "Sushi & Japanese",
    city: "Paris",
    priceFrom: 42,
    reviewCount: 1,
    image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=900&auto=format&fit=crop",
    verified: false,
  },
];

/** Per the rule: hide aggregate rating until ≥3 reviews exist. */
export const showRating = (reviewCount: number) => reviewCount >= 3;
