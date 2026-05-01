const express = require('express');
const router = express.Router();

const USE_GROQ = process.env.USE_GROQ === 'true';
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const LM_STUDIO_URL = process.env.LM_STUDIO_URL || 'http://localhost:1234';

// ─────────────────────────────────────────────
//  HOTEL DATABASE — Cox's Bazar
// ─────────────────────────────────────────────
const coxsBazarHotels = [
  // ⭐ LUXURY
  {
    id: 1, name: "Sea Pearl Beach Resort & Spa", tier: "Luxury",
    location: "Inani Beach, Ukhia", priceMin: 10000, priceMax: 20000, rating: 4.9,
    amenities: ["Beachfront", "Water Park", "Spa", "Infinity Pool", "Restaurants"],
    img: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400",
    bestFor: ["couple", "family"],
    rooms: [
      { type: "Deluxe Sea View", price: 10000, guests: 2, beds: "1 King" },
      { type: "Premium Ocean Suite", price: 14000, guests: 2, beds: "1 King + Sofa" },
      { type: "Family Suite", price: 18000, guests: 4, beds: "2 King" },
      { type: "Presidential Suite", price: 20000, guests: 4, beds: "2 King + Living Room" },
    ],
  },
  {
    id: 2, name: "Ocean Paradise Hotel & Resort", tier: "Luxury",
    location: "Kolatoli, Hotel Motel Zone", priceMin: 13000, priceMax: 22000, rating: 4.8,
    amenities: ["Rooftop Pool", "Gym", "Restaurant", "Sea View Rooms"],
    img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400",
    bestFor: ["couple", "family"],
    rooms: [
      { type: "Standard Sea View", price: 13000, guests: 2, beds: "1 Queen" },
      { type: "Deluxe Ocean Room", price: 16000, guests: 2, beds: "1 King" },
      { type: "Family Room", price: 20000, guests: 4, beds: "2 Queen" },
      { type: "Penthouse Suite", price: 22000, guests: 2, beds: "1 King + Lounge" },
    ],
  },
  {
    id: 3, name: "Long Beach Hotel", tier: "Luxury",
    location: "14 Kalatoli Road", priceMin: 9500, priceMax: 18000, rating: 4.7,
    amenities: ["Rooftop Pool", "Business Facilities", "Large Luxury Rooms"],
    img: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400",
    bestFor: ["solo", "couple", "group"],
    rooms: [
      { type: "Superior Room", price: 9500, guests: 2, beds: "1 Double" },
      { type: "Deluxe Room", price: 12000, guests: 2, beds: "1 King" },
      { type: "Business Suite", price: 15000, guests: 2, beds: "1 King + Work Desk" },
      { type: "Family Room", price: 18000, guests: 4, beds: "2 Double" },
    ],
  },
  {
    id: 4, name: "Sayeman Beach Resort", tier: "Luxury",
    location: "Marine Drive, Kolatoli Beach", priceMin: 10000, priceMax: 19000, rating: 4.8,
    amenities: ["Infinity Pool", "Beachfront Dining", "Premium Rooms"],
    img: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400",
    bestFor: ["couple", "family"],
    rooms: [
      { type: "Beach View Room", price: 10000, guests: 2, beds: "1 Queen" },
      { type: "Deluxe Suite", price: 14000, guests: 2, beds: "1 King" },
      { type: "Honeymoon Suite", price: 17000, guests: 2, beds: "1 King + Jacuzzi" },
      { type: "Family Villa", price: 19000, guests: 5, beds: "3 Single + 1 Double" },
    ],
  },
  {
    id: 5, name: "Hotel The Cox Today", tier: "Luxury",
    location: "Kolatoli Road, Hotel Motel Zone", priceMin: 7500, priceMax: 14000, rating: 4.6,
    amenities: ["Conference Hall", "Restaurant", "Near Beach"],
    img: "https://images.unsplash.com/photo-1529290130-4ca3753253ae?w=400",
    bestFor: ["solo", "couple", "group"],
    rooms: [
      { type: "Standard Room", price: 7500, guests: 2, beds: "1 Double" },
      { type: "Deluxe Room", price: 10000, guests: 2, beds: "1 King" },
      { type: "Executive Suite", price: 14000, guests: 2, beds: "1 King + Office Area" },
    ],
  },
  // 🌊 MID-RANGE
  {
    id: 6, name: "Seagull Hotel Ltd", tier: "Mid-Range",
    location: "Hotel Motel Zone, Sea Beach Road", priceMin: 5000, priceMax: 10000, rating: 4.5,
    amenities: ["Beachfront", "Swimming Pool", "Spa"],
    img: "https://images.unsplash.com/photo-1455587734955-081b22074882?w=400",
    bestFor: ["solo", "couple", "family"],
    rooms: [
      { type: "Standard Room", price: 5000, guests: 2, beds: "1 Double" },
      { type: "Sea View Room", price: 7000, guests: 2, beds: "1 King" },
      { type: "Family Room", price: 10000, guests: 4, beds: "2 Double" },
    ],
  },
  {
    id: 7, name: "Neeshorgo Hotel & Resort", tier: "Mid-Range",
    location: "Marine Drive Road, Kolatoli", priceMin: 3400, priceMax: 4700, rating: 4.3,
    amenities: ["Sea View Rooms", "Family-Friendly", "Quiet Location"],
    img: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400",
    bestFor: ["family", "couple"],
    rooms: [
      { type: "Standard Room", price: 3400, guests: 2, beds: "1 Double" },
      { type: "Sea View Room", price: 4000, guests: 2, beds: "1 Queen" },
      { type: "Family Room", price: 4700, guests: 4, beds: "2 Single + 1 Double" },
    ],
  },
  {
    id: 8, name: "Hotel Kollol", tier: "Mid-Range",
    location: "Laboni Beach Point", priceMin: 3000, priceMax: 5000, rating: 4.2,
    amenities: ["Beachfront", "Sea View Rooms", "Popular Tourist Hotel"],
    img: "https://images.unsplash.com/photo-1444201983204-c43cbd584d93?w=400",
    bestFor: ["solo", "couple"],
    rooms: [
      { type: "Economy Room", price: 3000, guests: 1, beds: "1 Single" },
      { type: "Standard Room", price: 3800, guests: 2, beds: "1 Double" },
      { type: "Sea View Room", price: 5000, guests: 2, beds: "1 Queen" },
    ],
  },
  {
    id: 9, name: "Best Western Heritage", tier: "Mid-Range",
    location: "Kolatoli Circle, Bypass Road", priceMin: 4300, priceMax: 8000, rating: 4.4,
    amenities: ["Modern Rooms", "Gym", "Dining", "Near Main Road"],
    img: "https://images.unsplash.com/photo-1506059612708-99d6c258160e?w=400",
    bestFor: ["solo", "couple", "family"],
    rooms: [
      { type: "Standard Room", price: 4300, guests: 2, beds: "1 Double" },
      { type: "Superior Room", price: 6000, guests: 2, beds: "1 King" },
      { type: "Family Room", price: 8000, guests: 4, beds: "2 Double" },
    ],
  },
  {
    id: 10, name: "Laguna Beach Hotel & Resort", tier: "Mid-Range",
    location: "Marine Drive", priceMin: 3900, priceMax: 7000, rating: 4.3,
    amenities: ["Beachside", "Balcony Rooms", "Swimming Pool"],
    img: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400",
    bestFor: ["couple", "family"],
    rooms: [
      { type: "Standard Room", price: 3900, guests: 2, beds: "1 Double" },
      { type: "Balcony Sea View", price: 5500, guests: 2, beds: "1 King" },
      { type: "Family Suite", price: 7000, guests: 4, beds: "2 Double + Balcony" },
    ],
  },
  {
    id: 11, name: "Praasad Paradise Hotel & Resort", tier: "Mid-Range",
    location: "Hotel Motel Zone", priceMin: 3500, priceMax: 6000, rating: 4.2,
    amenities: ["Family Hotel", "Restaurant", "Room Service"],
    img: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=400",
    bestFor: ["family", "group"],
    rooms: [
      { type: "Standard Room", price: 3500, guests: 2, beds: "1 Double" },
      { type: "Deluxe Room", price: 5000, guests: 2, beds: "1 King" },
      { type: "Family Room", price: 6000, guests: 5, beds: "1 Double + 2 Single" },
    ],
  },
  // 💸 BUDGET
  {
    id: 12, name: "Hotel Sea Queen", tier: "Budget",
    location: "Jhawtala Main Road", priceMin: 1300, priceMax: 2500, rating: 3.8,
    amenities: ["Cheap Rooms", "City Area", "Basic Facilities"],
    img: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400",
    bestFor: ["solo", "group"],
    rooms: [
      { type: "Single Room", price: 1300, guests: 1, beds: "1 Single" },
      { type: "Double Room", price: 2000, guests: 2, beds: "1 Double" },
      { type: "Triple Room", price: 2500, guests: 3, beds: "3 Single" },
    ],
  },
  {
    id: 13, name: "Hotel Sea Point", tier: "Budget",
    location: "Kolatoli Road", priceMin: 2000, priceMax: 3500, rating: 3.9,
    amenities: ["Near Beach", "Budget Friendly", "AC Rooms"],
    img: "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=400",
    bestFor: ["solo", "couple"],
    rooms: [
      { type: "Standard AC Room", price: 2000, guests: 2, beds: "1 Double" },
      { type: "Double AC Room", price: 2800, guests: 2, beds: "1 Queen" },
      { type: "Triple Room", price: 3500, guests: 3, beds: "3 Single" },
    ],
  },
  {
    id: 14, name: "Nisan Guest House", tier: "Budget",
    location: "Cox's Bazar town area", priceMin: 2400, priceMax: 4000, rating: 3.7,
    amenities: ["Very Cheap", "Simple Rooms", "Group-Friendly"],
    img: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400",
    bestFor: ["solo", "group"],
    rooms: [
      { type: "Single Room", price: 2400, guests: 1, beds: "1 Single" },
      { type: "Double Room", price: 3000, guests: 2, beds: "1 Double" },
      { type: "Dorm Room (4-bed)", price: 4000, guests: 4, beds: "4 Single" },
    ],
  },
  {
    id: 15, name: "Dream Guest Inn", tier: "Budget",
    location: "Kolatoli Main Road", priceMin: 3000, priceMax: 5000, rating: 4.0,
    amenities: ["Clean Rooms", "Tourist Zone", "Budget Stay"],
    img: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400",
    bestFor: ["couple", "family"],
    rooms: [
      { type: "Standard Room", price: 3000, guests: 2, beds: "1 Double" },
      { type: "Deluxe Room", price: 4000, guests: 2, beds: "1 Queen" },
      { type: "Family Room", price: 5000, guests: 4, beds: "2 Double" },
    ],
  },
  {
    id: 16, name: "Hotel South Beach", tier: "Budget",
    location: "Near Kolatoli / Beach Area", priceMin: 2800, priceMax: 4500, rating: 3.9,
    amenities: ["Affordable", "Near Beach", "Basic Comfort"],
    img: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=400",
    bestFor: ["solo", "couple"],
    rooms: [
      { type: "Standard Room", price: 2800, guests: 2, beds: "1 Double" },
      { type: "Superior Room", price: 3500, guests: 2, beds: "1 Queen" },
      { type: "Triple Room", price: 4500, guests: 3, beds: "3 Single" },
    ],
  },
  // 🏕️ UNIQUE
  {
    id: 17, name: "Sampan Beach Resort", tier: "Unique/Cottage",
    location: "Marine Drive, Himchori", priceMin: 4500, priceMax: 9000, rating: 4.6,
    amenities: ["Eco Cottages", "Beachfront", "Quiet Environment"],
    img: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=400",
    bestFor: ["couple", "family", "solo"],
    rooms: [
      { type: "Standard Cottage", price: 4500, guests: 2, beds: "1 Double" },
      { type: "Beachfront Cottage", price: 7000, guests: 2, beds: "1 King + Porch" },
      { type: "Family Cottage", price: 9000, guests: 5, beds: "2 Double + 1 Single" },
    ],
  },
  {
    id: 18, name: "Unity Inn", tier: "Budget",
    location: "Plot 41/B, Kolatoli", priceMin: 1300, priceMax: 2400, rating: 3.6,
    amenities: ["Cheap Guesthouse", "Good for Groups", "Near Attractions"],
    img: "https://images.unsplash.com/photo-1501117716987-c8c394bb29df?w=400",
    bestFor: ["solo", "group"],
    rooms: [
      { type: "Single Room", price: 1300, guests: 1, beds: "1 Single" },
      { type: "Double Room", price: 1800, guests: 2, beds: "1 Double" },
      { type: "Group Room (6-bed)", price: 2400, guests: 6, beds: "6 Single" },
    ],
  },
];

// ─────────────────────────────────────────────
//  HOTEL FILTER
// ─────────────────────────────────────────────
function filterHotels(budgetMin, budgetMax, travelType, duration) {
  const nightlyBudget = Math.floor(budgetMax / duration);

  return coxsBazarHotels
    .filter(h => h.priceMin <= nightlyBudget && h.bestFor.includes(travelType))
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 6)
    .map(hotel => {
      const suitableRooms = hotel.rooms.filter(r => r.price <= nightlyBudget);
      return { ...hotel, recommendedRoom: suitableRooms[0] || hotel.rooms[0] };
    });
}

// ─────────────────────────────────────────────
//  AI CALL
// ─────────────────────────────────────────────
async function callAI(prompt) {
  if (USE_GROQ) {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_API_KEY}` },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Groq error');
    return data.choices[0].message.content;
  } else {
    const res = await fetch(`${LM_STUDIO_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'local-model',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'LM Studio error');
    return data.choices[0].message.content;
  }
}

// ─────────────────────────────────────────────
//  AI PROMPT
// ─────────────────────────────────────────────
function buildPrompt({ destination, duration, travelType, budgetMin, budgetMax, hotels }) {
  const hotelNames = hotels.map(h => `${h.name} (${h.tier}, ৳${h.priceMin}–৳${h.priceMax}/night)`).join(', ');
  const labels = { solo: 'Solo Traveler', couple: 'Couple', family: 'Family', group: 'Group' };

  return `
You are an expert Bangladeshi travel planner. Create a detailed day-by-day travel itinerary.

TRIP DETAILS:
- Destination: ${destination}
- Duration: ${duration} days
- Travel Type: ${labels[travelType] || travelType}
- Budget: ৳${budgetMin.toLocaleString()} – ৳${budgetMax.toLocaleString()} total
- Available Hotels: ${hotelNames}

Return ONLY this JSON structure, no extra text, no markdown fences:
{
  "overview": "2-3 sentence trip summary",
  "tips": ["tip1", "tip2", "tip3"],
  "days": [
    {
      "day": 1,
      "title": "Day title",
      "theme": "Theme",
      "activities": [
        { "time": "8:00 AM", "activity": "Name", "description": "Short detail", "type": "food|attraction|leisure|travel" }
      ],
      "estimatedDailyCost": 3000
    }
  ],
  "recommendedHotel": "One hotel name from the list above",
  "budgetBreakdown": {
    "hotel": 15000,
    "food": 8000,
    "transport": 3000,
    "activities": 4000,
    "total": 30000
  }
}

Rules:
- Use real Cox's Bazar spots: Laboni Beach, Inani Beach, Himchori Waterfall, Ramu Buddhist Temple, Marine Drive, Kolatoli etc.
- Include local food: shutki, hilsa, fresh seafood, street food
- Personalize for ${labels[travelType] || travelType}
- Keep budget within ৳${budgetMin.toLocaleString()} – ৳${budgetMax.toLocaleString()}
- Return ONLY valid JSON
`.trim();
}

// ─────────────────────────────────────────────
//  FALLBACK ITINERARY (if AI is down)
// ─────────────────────────────────────────────
function fallbackItinerary(destination, duration, travelType) {
  const spots = ['Laboni Beach', 'Inani Beach', 'Himchori Waterfall', 'Ramu Buddhist Temple', 'Marine Drive'];
  const days = Array.from({ length: Math.min(duration, 7) }, (_, i) => ({
    day: i + 1,
    title: i === 0 ? 'Arrival & Laboni Beach' : i === duration - 1 ? 'Departure Day' : `Day ${i + 1} — ${spots[i % spots.length]}`,
    theme: i === 0 ? 'Arrival' : i % 2 === 0 ? 'Beach & Nature' : 'Culture & Food',
    activities: [
      { time: '8:00 AM', activity: 'Breakfast', description: 'Hotel breakfast or local tea stall', type: 'food' },
      { time: '10:00 AM', activity: spots[i % spots.length], description: 'Explore the area', type: 'attraction' },
      { time: '1:00 PM', activity: 'Lunch at seafood restaurant', description: 'Fresh fish & Bengali dishes', type: 'food' },
      { time: '3:00 PM', activity: 'Kolatoli Beach walk', description: 'Relax and explore', type: 'leisure' },
      { time: '7:00 PM', activity: 'Dinner at local seafood market', description: 'Try grilled fish and hilsa', type: 'food' },
    ],
    estimatedDailyCost: 4500,
  }));
  return {
    overview: `A ${duration}-day trip to ${destination} for a ${travelType}. Enjoy the world's longest sea beach, fresh seafood, and scenic Marine Drive.`,
    tips: [
      'Best time to visit is October to March for pleasant weather.',
      'Always bargain with CNG drivers and at local markets.',
      'Try shutki (dried fish) — a Cox\'s Bazar specialty.',
    ],
    days,
    recommendedHotel: 'Hotel Kollol',
    budgetBreakdown: {
      hotel: duration * 4000,
      food: duration * 1500,
      transport: 3000,
      activities: 2000,
      total: duration * 5500 + 5000,
    },
  };
}

// ─────────────────────────────────────────────
//  ROUTES
// ─────────────────────────────────────────────

// POST /api/trip/plan
router.post('/plan', async (req, res) => {
  const { destination, duration, travelType, budgetMin, budgetMax } = req.body;

  if (!destination || !duration || !travelType) {
    return res.status(400).json({ error: 'destination, duration, and travelType are required.' });
  }

  const durationNum = Number(duration);
  const budgetMinNum = Number(budgetMin) || 0;
  const budgetMaxNum = Number(budgetMax) || 50000;

  try {
    const filteredHotels = filterHotels(budgetMinNum, budgetMaxNum, travelType, durationNum);

    let aiPlan;
    try {
      const raw = await callAI(buildPrompt({
        destination, duration: durationNum, travelType,
        budgetMin: budgetMinNum, budgetMax: budgetMaxNum,
        hotels: filteredHotels,
      }));
      const cleaned = raw.replace(/```json|```/g, '').trim();
      aiPlan = JSON.parse(cleaned);
    } catch (aiErr) {
      console.error('AI failed, using fallback:', aiErr.message);
      aiPlan = fallbackItinerary(destination, durationNum, travelType);
    }

    const recommendedHotel =
      filteredHotels.find(h =>
        aiPlan.recommendedHotel?.toLowerCase().includes(h.name.toLowerCase().split(' ')[0])
      ) || filteredHotels[0];

    res.json({
      success: true,
      destination, duration: durationNum, travelType,
      budgetMin: budgetMinNum, budgetMax: budgetMaxNum,
      aiPlan,
      hotels: filteredHotels,
      recommendedHotel,
    });

  } catch (err) {
    console.error('Trip plan error:', err);
    res.status(500).json({ error: 'Failed to generate trip plan.' });
  }
});

// GET /api/trip/hotels — browse hotels with optional filters
router.get('/hotels', (req, res) => {
  const { budgetMax, travelType, duration, tier } = req.query;
  let hotels = [...coxsBazarHotels];

  if (tier) hotels = hotels.filter(h => h.tier.toLowerCase() === tier.toLowerCase());
  if (travelType) hotels = hotels.filter(h => h.bestFor.includes(travelType));
  if (budgetMax && duration) {
    const nightly = Math.floor(Number(budgetMax) / Number(duration));
    hotels = hotels.filter(h => h.priceMin <= nightly);
  }

  res.json({ success: true, count: hotels.length, hotels });
});

module.exports = router;