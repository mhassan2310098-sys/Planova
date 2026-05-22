const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

const USE_GROQ = process.env.USE_GROQ === 'true';
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const LM_STUDIO_URL = process.env.LM_STUDIO_URL || 'http://localhost:1234';

// ─────────────────────────────────────────────
//  DESTINATION INFO DATABASE
// ─────────────────────────────────────────────
const destinationInfo = {
  "cox's bazar": {
    about: "Cox's Bazar is a town on the southeast coast of Bangladesh. It's known for its very long, sandy beachfront, stretching for over 120 kilometers. A major tourist destination in Bangladesh, it's home to various species of birds and marine life.",
    attractions: [
      { name: "Cox's Bazar Beach", desc: "World's longest natural sea beach", emoji: "🏖️" },
      { name: "Himchari National Park", desc: "Beautiful waterfalls and hiking trails", emoji: "🏔️" },
      { name: "Inani Beach", desc: "Crystal clear water and coral stones", emoji: "🌊" },
      { name: "Buddhist Temple", desc: "Ancient Buddhist monastery", emoji: "🏛️" },
      { name: "Marine Drive", desc: "Scenic 80km coastal highway", emoji: "🛣️" },
      { name: "Laboni Beach", desc: "Most popular beach point", emoji: "🏖️" },
    ],
    activities: [
      "Swimming and sunbathing at the beach",
      "Water sports (surfing, jet skiing)",
      "Visit Himchari waterfalls",
      "Explore Buddhist temples and pagodas",
      "Sunset watching at the beach",
      "Fresh seafood dining",
      "Shopping at local markets",
      "Photography and nature walks",
    ],
    transport: [
      { mode: "BY AIR", desc: "Direct flights from Dhaka to Cox's Bazar Airport", duration: "1 hour", cost: "৳4,000-8,000", emoji: "✈️" },
      { mode: "BY BUS", desc: "Regular AC and non-AC buses from Dhaka", duration: "10-12 hours", cost: "৳800-2,000", emoji: "🚌" },
      { mode: "BY TRAIN", desc: "Train to Chittagong, then bus to Cox's Bazar", duration: "14-16 hours", cost: "৳1,000-3,000", emoji: "🚂" },
    ],
    bestTime: "October to March",
    weather: "Tropical — hot summers, heavy monsoon, pleasant winters",
    packingTips: ["Light cotton clothes", "Sunscreen & sunglasses", "Waterproof sandals", "Rain jacket (monsoon season)", "Camera"],
    safetyTips: ["Swim only at designated areas", "Beware of strong currents", "Keep valuables secure at beach", "Use licensed tour guides"],
    etiquette: ["Dress modestly away from beach areas", "Ask permission before photographing locals", "Bargain politely at markets", "Respect religious sites"],
  },

  "dhaka": {
    about: "Dhaka is the capital and largest city of Bangladesh. A megacity of over 20 million people, it's one of the most densely populated cities in the world. Known for its rich history, vibrant culture, street food, and bustling bazaars.",
    attractions: [
      { name: "Lalbagh Fort", desc: "17th century Mughal fort complex", emoji: "🏰" },
      { name: "Ahsan Manzil", desc: "Pink palace museum on the Buriganga", emoji: "🏛️" },
      { name: "Dhakeshwari Temple", desc: "National temple of Bangladesh", emoji: "⛩️" },
      { name: "Sadarghat", desc: "World's busiest river port", emoji: "⛵" },
      { name: "National Museum", desc: "Bangladesh's largest museum", emoji: "🏛️" },
      { name: "Hatirjheel", desc: "Beautiful lakeside walkway and bridge", emoji: "🌉" },
    ],
    activities: [
      "Explore Old Dhaka's historic streets",
      "Visit Lalbagh Fort and Ahsan Manzil",
      "Boat ride at Sadarghat",
      "Street food tour in Chawkbazar",
      "Shopping at Bashundhara City",
      "Visit Liberation War Museum",
      "Rickshaw ride through Old Dhaka",
      "Try authentic Dhaka biryani",
    ],
    transport: [
      { mode: "BY AIR", desc: "Hazrat Shahjalal International Airport — well connected to all cities", duration: "1-2 hours from major cities", cost: "৳3,000-10,000", emoji: "✈️" },
      { mode: "BY BUS", desc: "Interstate buses from all major cities of Bangladesh", duration: "Varies by city", cost: "৳300-1,500", emoji: "🚌" },
      { mode: "BY TRAIN", desc: "Kamalapur Railway Station connects to all major cities", duration: "Varies by city", cost: "৳200-1,200", emoji: "🚂" },
    ],
    bestTime: "November to February",
    weather: "Tropical — hot and humid summers, mild winters",
    packingTips: ["Comfortable walking shoes", "Light breathable clothes", "Face mask (air quality)", "Power bank", "Cash in Taka"],
    safetyTips: ["Use ride-sharing apps (Pathao, Uber)", "Avoid peak traffic hours", "Keep bags close in crowded areas", "Stay in known tourist zones"],
    etiquette: ["Dress conservatively", "Remove shoes before entering mosques", "Greet with 'Assalamu Alaikum'", "Avoid public displays of affection"],
  },

  "sylhet": {
    about: "Sylhet is a major city in northeastern Bangladesh, renowned for its vast tea gardens, natural gas reserves, and spiritual significance. The city is surrounded by lush green hills, haors (wetlands), and some of the most beautiful landscapes in Bangladesh.",
    attractions: [
      { name: "Ratargul Swamp Forest", desc: "Only freshwater swamp forest in Bangladesh", emoji: "🌿" },
      { name: "Jaflong", desc: "Stone collection point with river views", emoji: "🏔️" },
      { name: "Srimangal Tea Gardens", desc: "World's largest tea garden area", emoji: "🍵" },
      { name: "Hazrat Shah Jalal Dargah", desc: "Famous shrine of Sufi saint", emoji: "🕌" },
      { name: "Bichanakandi", desc: "Stunning rock and river landscape", emoji: "🌊" },
      { name: "Lawachara National Park", desc: "Rainforest with rare wildlife", emoji: "🌳" },
    ],
    activities: [
      "Boat tour in Ratargul swamp forest",
      "Tea garden walks in Srimangal",
      "Visit Hazrat Shah Jalal Dargah",
      "Stone collection at Jaflong",
      "Birdwatching in Lawachara",
      "Try 7-layer tea at Srimangal",
      "Haor boat rides",
      "Visit Bisnakandi",
    ],
    transport: [
      { mode: "BY AIR", desc: "Osmani International Airport with flights from Dhaka", duration: "45 minutes", cost: "৳3,500-7,000", emoji: "✈️" },
      { mode: "BY BUS", desc: "AC buses from Dhaka to Sylhet", duration: "4-5 hours", cost: "৳600-1,200", emoji: "🚌" },
      { mode: "BY TRAIN", desc: "Parabat/Jayantika Express from Dhaka", duration: "6-7 hours", cost: "৳300-800", emoji: "🚂" },
    ],
    bestTime: "October to March",
    weather: "Subtropical highlands — misty winters, heavy rainfall in monsoon",
    packingTips: ["Warm layers for misty mornings", "Waterproof shoes", "Rain jacket", "Insect repellent", "Binoculars for birdwatching"],
    safetyTips: ["Hire local guides for forest tours", "Check water levels before haor trips", "Avoid isolated areas at night", "Keep emergency contacts handy"],
    etiquette: ["Respect religious sites", "Ask before photographing tea workers", "Don't litter in natural areas", "Follow forest guidelines"],
  },

  "chittagong": {
    about: "Chittagong, officially Chattogram, is the second-largest city of Bangladesh and the country's main seaport. Known for its hills, beaches, and as a major commercial hub, it's the gateway to Cox's Bazar and the Chittagong Hill Tracts.",
    attractions: [
      { name: "Patenga Beach", desc: "Popular sea beach near the airport", emoji: "🏖️" },
      { name: "Foy's Lake", desc: "Artificial lake with amusement park", emoji: "🏞️" },
      { name: "Ethnological Museum", desc: "Rare museum of tribal cultures", emoji: "🏛️" },
      { name: "Zia Memorial Museum", desc: "Historical museum in Chittagong", emoji: "🏛️" },
      { name: "Ship Breaking Yard", desc: "World famous ship recycling industry", emoji: "🚢" },
      { name: "Chandranath Hill", desc: "Sacred hilltop Hindu temple", emoji: "⛩️" },
    ],
    activities: [
      "Visit Patenga Beach at sunset",
      "Explore ship breaking yards",
      "Hike to Chandranath Hill temple",
      "Visit Foy's Lake",
      "Explore the port area",
      "Try Chittagong's famous mezbani beef",
      "Shop at Reazuddin Bazaar",
      "Day trip to Cox's Bazar",
    ],
    transport: [
      { mode: "BY AIR", desc: "Shah Amanat International Airport with domestic flights", duration: "1 hour from Dhaka", cost: "৳3,000-7,000", emoji: "✈️" },
      { mode: "BY BUS", desc: "Multiple bus services from Dhaka and other cities", duration: "5-6 hours from Dhaka", cost: "৳500-1,200", emoji: "🚌" },
      { mode: "BY TRAIN", desc: "Subarna/Turna Express from Dhaka", duration: "5-6 hours", cost: "৳300-900", emoji: "🚂" },
    ],
    bestTime: "November to February",
    weather: "Tropical — hot summers, heavy monsoon, pleasant winters",
    packingTips: ["Comfortable walking shoes", "Light clothes", "Sunscreen", "Camera", "Cash"],
    safetyTips: ["Use registered taxis", "Avoid port areas after dark", "Keep documents safe", "Stay hydrated"],
    etiquette: ["Dress modestly", "Respect port regulations", "Be polite with locals", "Follow temple rules"],
  },

  "bandarban": {
    about: "Bandarban is a district in the Chittagong Hill Tracts of Bangladesh. It's the least populated and most remote district in Bangladesh, known for its stunning mountain scenery, tribal cultures, waterfalls, and Bangladesh's highest peaks.",
    attractions: [
      { name: "Nilgiri", desc: "Highest tourist spot in Bangladesh at 2,200ft", emoji: "🏔️" },
      { name: "Nafakhum Waterfall", desc: "Largest waterfall in Bangladesh", emoji: "💧" },
      { name: "Boga Lake", desc: "Mysterious natural lake in the hills", emoji: "🏞️" },
      { name: "Chimbuk Hill", desc: "Third highest peak with cloud views", emoji: "⛰️" },
      { name: "Meghla Tourist Complex", desc: "Lake, cable car and zoo", emoji: "🚡" },
      { name: "Sajek Valley", desc: "Cloud valley on the hilltops", emoji: "☁️" },
    ],
    activities: [
      "Trek to Nilgiri and watch sunrise",
      "Visit Nafakhum waterfall",
      "Explore Boga Lake",
      "Meet and learn from tribal communities",
      "Ride cable car at Meghla",
      "Bonfire nights at hill resorts",
      "Photograph cloud sea at Sajek",
      "Trek through bamboo forests",
    ],
    transport: [
      { mode: "BY BUS", desc: "Direct buses from Chittagong and Dhaka", duration: "3 hours from Chittagong", cost: "৳200-600", emoji: "🚌" },
      { mode: "BY CAR", desc: "Private car or CNG from Chittagong", duration: "2.5 hours", cost: "৳2,000-4,000", emoji: "🚗" },
      { mode: "BY JEEP", desc: "Local jeep service for hill areas", duration: "Varies by destination", cost: "৳500-2,000", emoji: "🚙" },
    ],
    bestTime: "October to February",
    weather: "Highland tropical — cool winters, heavy monsoon, misty mornings year round",
    packingTips: ["Warm jacket for nights", "Trekking shoes", "Torch/flashlight", "Rain jacket", "First aid kit", "Insect repellent"],
    safetyTips: ["Get permits for restricted areas", "Hire local guides for treks", "Inform someone of your route", "Carry enough water", "Check weather before trekking"],
    etiquette: ["Respect tribal customs and dress codes", "Ask before photographing tribal people", "Don't disturb wildlife", "Take garbage back with you"],
  },

  "rangamati": {
    about: "Rangamati is a scenic district in the Chittagong Hill Tracts, known for Kaptai Lake — the largest man-made lake in Bangladesh. The area is home to various indigenous tribes and offers stunning lake views, handicrafts, and natural beauty.",
    attractions: [
      { name: "Kaptai Lake", desc: "Largest man-made lake in Bangladesh", emoji: "🏞️" },
      { name: "Hanging Bridge", desc: "Unique suspension bridge over the lake", emoji: "🌉" },
      { name: "Rajbari", desc: "Palace of the Chakma King", emoji: "🏰" },
      { name: "Tribal Museum", desc: "Museum of indigenous hill people", emoji: "🏛️" },
      { name: "Shuvolong Waterfall", desc: "Beautiful waterfall accessible by boat", emoji: "💧" },
      { name: "Buddhist Temple", desc: "Ancient temples on the hilltops", emoji: "🏛️" },
    ],
    activities: [
      "Boat tour on Kaptai Lake",
      "Visit Shuvolong waterfall by boat",
      "Explore tribal markets",
      "Buy handwoven tribal crafts",
      "Visit Rajbari palace",
      "Sunrise at the lake",
      "Fishing in Kaptai Lake",
      "Explore Buddhist temples",
    ],
    transport: [
      { mode: "BY BUS", desc: "Direct buses from Chittagong", duration: "2 hours from Chittagong", cost: "৳150-400", emoji: "🚌" },
      { mode: "BY BOAT", desc: "Speedboat from Chittagong via Kaptai", duration: "3-4 hours", cost: "৳500-1,500", emoji: "⛵" },
      { mode: "BY CAR", desc: "Private car from Chittagong or Dhaka", duration: "2 hours from Chittagong", cost: "৳2,000-3,500", emoji: "🚗" },
    ],
    bestTime: "October to March",
    weather: "Highland tropical — pleasant winters, heavy monsoon",
    packingTips: ["Light clothes", "Comfortable shoes", "Sunscreen", "Camera", "Cash (limited ATMs)"],
    safetyTips: ["Use life jackets on boats", "Hire registered boat operators", "Keep permit documents ready", "Stay in groups at night"],
    etiquette: ["Respect tribal customs", "Don't enter restricted areas", "Ask before photographing", "Respect Buddhist sites"],
  },

  "khulna": {
    about: "Khulna is the third-largest city of Bangladesh and the gateway to the Sundarbans — the world's largest mangrove forest and a UNESCO World Heritage Site. The city is known for its industrial importance and proximity to unique wildlife.",
    attractions: [
      { name: "Sundarbans", desc: "World's largest mangrove forest — UNESCO site", emoji: "🌿" },
      { name: "Khan Jahan Ali Mosque", desc: "15th century historic mosque", emoji: "🕌" },
      { name: "Sixty Dome Mosque", desc: "UNESCO listed mosque in Bagerhat", emoji: "🏛️" },
      { name: "Mongla Port", desc: "Second largest seaport of Bangladesh", emoji: "⚓" },
      { name: "Bagerhat Museum", desc: "Historic artifacts of the region", emoji: "🏛️" },
      { name: "Rupsha River", desc: "Scenic riverside views", emoji: "🌊" },
    ],
    activities: [
      "Sundarbans boat safari",
      "Spot Royal Bengal Tiger tracks",
      "Birdwatching in the mangroves",
      "Visit Sixty Dome Mosque in Bagerhat",
      "Sunset at Rupsha river",
      "Explore Mongla port",
      "Try Khulna's famous shutki dishes",
      "Night stay in Sundarbans eco camp",
    ],
    transport: [
      { mode: "BY TRAIN", desc: "Sundarban Express from Dhaka to Khulna", duration: "9-10 hours", cost: "৳400-1,200", emoji: "🚂" },
      { mode: "BY BUS", desc: "AC buses from Dhaka", duration: "8-9 hours", cost: "৳600-1,500", emoji: "🚌" },
      { mode: "BY LAUNCH", desc: "Rocket steamer from Dhaka — scenic river route", duration: "18-20 hours", cost: "৳500-2,000", emoji: "⛵" },
    ],
    bestTime: "November to February",
    weather: "Tropical — hot and humid, heavy monsoon, pleasant winters",
    packingTips: ["Light breathable clothes", "Insect repellent", "Waterproof shoes", "Binoculars for wildlife", "Torch"],
    safetyTips: ["Always go with licensed Sundarbans guides", "Don't wander alone in the forest", "Follow guide instructions strictly", "Keep noise levels low for wildlife"],
    etiquette: ["Don't litter in the Sundarbans", "Respect wildlife — maintain distance", "Follow forest department rules", "Respect local fishing communities"],
  },

  "maldives": {
    about: "The Maldives is a tropical nation in the Indian Ocean, composed of 26 ring-shaped atolls with over 1,000 coral islands. Famous for its crystal-clear lagoons, overwater bungalows, and world-class diving, it's one of the world's top luxury destinations.",
    attractions: [
      { name: "Male City", desc: "Colorful capital island with local life", emoji: "🏙️" },
      { name: "Bioluminescent Beach", desc: "Glowing plankton beach at Vaadhoo Island", emoji: "✨" },
      { name: "Banana Reef", desc: "World famous diving site", emoji: "🤿" },
      { name: "Hulhumale Beach", desc: "Beautiful public beach near airport", emoji: "🏖️" },
      { name: "Underwater Restaurant", desc: "Ithaa undersea restaurant experience", emoji: "🐠" },
      { name: "Manta Point", desc: "Famous manta ray snorkeling site", emoji: "🦈" },
    ],
    activities: [
      "Snorkeling with manta rays and whale sharks",
      "Scuba diving at coral reefs",
      "Sunset dolphin cruise",
      "Overwater bungalow stay",
      "Island hopping by speedboat",
      "Underwater dining experience",
      "Sandbank picnic",
      "Water sports — parasailing, jet ski",
    ],
    transport: [
      { mode: "BY AIR", desc: "Velana International Airport, Male — fly from Dhaka via transit", duration: "4-6 hours with transit", cost: "৳25,000-60,000", emoji: "✈️" },
      { mode: "SPEEDBOAT", desc: "From Male airport to resort islands", duration: "20 mins - 2 hours", cost: "৳3,000-8,000", emoji: "🚤" },
      { mode: "SEAPLANE", desc: "Luxury transfer to remote atolls", duration: "20-45 minutes", cost: "৳15,000-40,000", emoji: "🛥️" },
    ],
    bestTime: "November to April",
    weather: "Tropical — dry season Nov-Apr, wet season May-Oct",
    packingTips: ["Swimwear and beachwear", "Reef-safe sunscreen", "Light summer clothes", "Underwater camera", "Formal wear for resort dinners"],
    safetyTips: ["Never touch coral reefs", "Follow dive safety guidelines", "Check current forecasts before water activities", "Keep resort emergency number saved"],
    etiquette: ["Respect local island dress codes — cover up in inhabited islands", "Alcohol only allowed in resort islands", "No pork products in local islands", "Remove shoes before entering mosques"],
  },

  "thailand": {
    about: "Thailand is a Southeast Asian country known for its ornate temples, beautiful beaches, and vibrant street life. From the bustling streets of Bangkok to the serene islands of the south, Thailand offers an incredible mix of culture, cuisine, and natural beauty.",
    attractions: [
      { name: "Grand Palace Bangkok", desc: "Iconic royal palace and Wat Phra Kaew", emoji: "🏯" },
      { name: "Phi Phi Islands", desc: "Stunning limestone cliffs and clear waters", emoji: "🏝️" },
      { name: "Chiang Mai Old City", desc: "Ancient walled city with 300 temples", emoji: "🏛️" },
      { name: "Floating Markets", desc: "Traditional markets on canals", emoji: "⛵" },
      { name: "Ayutthaya", desc: "Ancient capital ruins — UNESCO site", emoji: "🏰" },
      { name: "Elephant Sanctuaries", desc: "Ethical elephant encounters in Chiang Mai", emoji: "🐘" },
    ],
    activities: [
      "Visit Grand Palace and Wat Pho",
      "Street food tour in Bangkok",
      "Island hopping in Krabi or Phuket",
      "Ethical elephant sanctuary visit",
      "Thai massage and spa",
      "Muay Thai boxing match",
      "Night markets shopping",
      "Temple hopping in Chiang Mai",
    ],
    transport: [
      { mode: "BY AIR", desc: "Suvarnabhumi Airport Bangkok — fly from Dhaka", duration: "2-3 hours", cost: "৳15,000-35,000", emoji: "✈️" },
      { mode: "BTS SKYTRAIN", desc: "Bangkok's elevated rail system", duration: "Varies", cost: "৳150-500", emoji: "🚇" },
      { mode: "TUK TUK", desc: "Iconic three-wheeler for short trips", duration: "Varies", cost: "৳100-300", emoji: "🛺" },
    ],
    bestTime: "November to February",
    weather: "Tropical — hot season Mar-May, rainy Jun-Oct, cool Nov-Feb",
    packingTips: ["Light breathable clothes", "Temple-appropriate cover-ups", "Comfortable walking shoes", "Insect repellent", "Travel adapter"],
    safetyTips: ["Keep passport copy separate from original", "Negotiate tuk tuk prices beforehand", "Be careful of gem scams", "Drink bottled water only"],
    etiquette: ["Remove shoes before entering temples", "Never touch someone's head", "Don't point feet at sacred objects", "Dress modestly at temples"],
  },

  "dubai": {
    about: "Dubai is a city and emirate in the United Arab Emirates known for its ultramodern architecture, luxury shopping, and lively nightlife. Home to the world's tallest building, artificial islands, and an indoor ski slope, Dubai is a city of extremes and ambition.",
    attractions: [
      { name: "Burj Khalifa", desc: "World's tallest building at 828m", emoji: "🏙️" },
      { name: "Palm Jumeirah", desc: "Iconic man-made palm shaped island", emoji: "🌴" },
      { name: "Dubai Mall", desc: "World's largest shopping mall", emoji: "🛍️" },
      { name: "Dubai Creek", desc: "Historic waterway with gold & spice souks", emoji: "⛵" },
      { name: "Desert Safari", desc: "Dune bashing and Bedouin camp experience", emoji: "🏜️" },
      { name: "Dubai Frame", desc: "Giant picture frame with city views", emoji: "🖼️" },
    ],
    activities: [
      "Visit Burj Khalifa observation deck",
      "Desert safari and dune bashing",
      "Shop at Dubai Mall and Gold Souk",
      "Dinner cruise on Dubai Creek",
      "Ski Dubai indoor skiing",
      "Dubai Fountain show",
      "Visit Jumeirah Mosque",
      "Explore Dubai Museum",
    ],
    transport: [
      { mode: "BY AIR", desc: "Dubai International Airport — fly from Dhaka", duration: "4-5 hours", cost: "৳25,000-60,000", emoji: "✈️" },
      { mode: "DUBAI METRO", desc: "Modern automated metro system", duration: "Varies", cost: "৳200-600", emoji: "🚇" },
      { mode: "TAXI/UBER", desc: "Metered taxis and Careem app available", duration: "Varies", cost: "৳500-3,000", emoji: "🚖" },
    ],
    bestTime: "November to March",
    weather: "Desert climate — extremely hot summers, pleasant winters",
    packingTips: ["Light summer clothes", "Modest cover-ups for malls/mosques", "Sunscreen", "Comfortable shoes", "Formal wear for fine dining"],
    safetyTips: ["Alcohol only in licensed venues", "Public displays of affection illegal", "Jaywalking is fined", "Dress modestly in public areas"],
    etiquette: ["Dress modestly outside hotels/beaches", "Ramadan rules — no eating in public during fasting hours", "Right hand for greetings", "Stand for national anthem"],
  },

  "singapore": {
    about: "Singapore is a city-state island nation in Southeast Asia, known for its ultramodern cityscape, strict laws, and extraordinary cleanliness. It's a global financial hub that blends Chinese, Malay, and Indian cultures with cutting-edge architecture and world-class food.",
    attractions: [
      { name: "Marina Bay Sands", desc: "Iconic hotel with infinity pool and skypark", emoji: "🏙️" },
      { name: "Gardens by the Bay", desc: "Futuristic Supertree Grove and domes", emoji: "🌳" },
      { name: "Sentosa Island", desc: "Resort island with Universal Studios", emoji: "🎢" },
      { name: "Chinatown", desc: "Historic Chinese quarter with temples", emoji: "🏮" },
      { name: "Little India", desc: "Colorful Indian cultural district", emoji: "🌸" },
      { name: "Orchard Road", desc: "Famous shopping boulevard", emoji: "🛍️" },
    ],
    activities: [
      "Visit Gardens by the Bay",
      "Universal Studios Singapore",
      "Hawker centre food tour",
      "Night safari at Singapore Zoo",
      "Marina Bay Sands Skypark",
      "Explore Chinatown and Little India",
      "Shopping on Orchard Road",
      "Sentosa beach and cable car",
    ],
    transport: [
      { mode: "BY AIR", desc: "Changi Airport — fly from Dhaka", duration: "3-4 hours", cost: "৳20,000-45,000", emoji: "✈️" },
      { mode: "MRT", desc: "Singapore's world-class metro system", duration: "Varies", cost: "৳150-500", emoji: "🚇" },
      { mode: "GRAB", desc: "Southeast Asia's ride-hailing app", duration: "Varies", cost: "৳300-1,500", emoji: "🚖" },
    ],
    bestTime: "February to April",
    weather: "Tropical — hot and humid year round, frequent short showers",
    packingTips: ["Light clothes", "Umbrella/rain jacket", "Comfortable walking shoes", "Power bank", "Travel card for MRT"],
    safetyTips: ["No chewing gum allowed", "No littering — heavy fines", "Jaywalking is illegal", "Drugs carry death penalty"],
    etiquette: ["Queue orderly for everything", "Finish food — don't waste at hawker centres", "Speak quietly in public", "Give up seats for elderly on MRT"],
  },

  "nepal": {
    about: "Nepal is a landlocked country in South Asia, home to eight of the world's ten highest mountains including Mount Everest. Beyond its towering peaks, Nepal offers ancient temples, vibrant culture, and some of the world's best trekking routes.",
    attractions: [
      { name: "Everest Base Camp", desc: "Trek to the foot of the world's highest peak", emoji: "🏔️" },
      { name: "Pashupatinath Temple", desc: "Sacred Hindu temple on the Bagmati river", emoji: "⛩️" },
      { name: "Boudhanath Stupa", desc: "One of the largest stupas in the world", emoji: "🕌" },
      { name: "Pokhara", desc: "Lakeside city with Himalayan views", emoji: "🏞️" },
      { name: "Chitwan National Park", desc: "Home to rhinos and Bengal tigers", emoji: "🦏" },
      { name: "Swayambhunath", desc: "Monkey temple overlooking Kathmandu", emoji: "🐒" },
    ],
    activities: [
      "Trek to Everest Base Camp",
      "Paragliding in Pokhara",
      "Sunrise view from Nagarkot",
      "Visit Pashupatinath temple",
      "White water rafting",
      "Jungle safari in Chitwan",
      "Mountain flight over Himalayas",
      "Explore Thamel bazaar",
    ],
    transport: [
      { mode: "BY AIR", desc: "Tribhuvan International Airport Kathmandu — fly from Dhaka", duration: "1.5 hours", cost: "৳10,000-25,000", emoji: "✈️" },
      { mode: "BY BUS", desc: "Tourist buses between Kathmandu and Pokhara", duration: "7-8 hours", cost: "৳600-1,500", emoji: "🚌" },
      { mode: "DOMESTIC FLIGHT", desc: "Kathmandu to Lukla for Everest trek", duration: "35 minutes", cost: "৳8,000-15,000", emoji: "🛩️" },
    ],
    bestTime: "March to May and September to November",
    weather: "Varies by altitude — warm valleys, cold mountains, monsoon Jun-Aug",
    packingTips: ["Warm layers for trekking", "Trekking boots", "Sleeping bag for high altitude", "Altitude sickness medicine", "Trekking poles"],
    safetyTips: ["Acclimatize properly at high altitude", "Get travel insurance with evacuation cover", "Hire licensed trekking guides", "Check permit requirements"],
    etiquette: ["Walk clockwise around stupas and mani walls", "Remove shoes before temples", "Don't offer leather items to Hindus", "Use right hand for giving/receiving"],
  },

  "bali": {
    about: "Bali is an Indonesian island known for its forested volcanic mountains, iconic rice paddies, beaches, and coral reefs. The island is also known for its wellness retreats, vibrant arts scene, and spiritual Hindu culture that sets it apart from the rest of Indonesia.",
    attractions: [
      { name: "Tanah Lot Temple", desc: "Iconic sea temple at sunset", emoji: "🏛️" },
      { name: "Ubud Monkey Forest", desc: "Sacred forest with macaque monkeys", emoji: "🐒" },
      { name: "Tegalalang Rice Terraces", desc: "Stunning cascading rice paddies", emoji: "🌾" },
      { name: "Seminyak Beach", desc: "Trendy beach with beach clubs", emoji: "🏖️" },
      { name: "Mount Batur", desc: "Active volcano — popular sunrise trek", emoji: "🌋" },
      { name: "Uluwatu Temple", desc: "Clifftop temple with Kecak dance", emoji: "⛩️" },
    ],
    activities: [
      "Sunrise trek up Mount Batur",
      "Visit Tanah Lot at sunset",
      "Rice terrace walk in Tegalalang",
      "Surfing lessons in Kuta",
      "Balinese cooking class",
      "Traditional Kecak dance show",
      "Spa and wellness retreat",
      "Snorkeling in Nusa Penida",
    ],
    transport: [
      { mode: "BY AIR", desc: "Ngurah Rai Airport Bali — fly from Dhaka via transit", duration: "6-8 hours with transit", cost: "৳25,000-55,000", emoji: "✈️" },
      { mode: "SCOOTER", desc: "Rent scooter for easy island exploration", duration: "Varies", cost: "৳300-600/day", emoji: "🛵" },
      { mode: "PRIVATE DRIVER", desc: "Hire a car with driver for day trips", duration: "Varies", cost: "৳2,500-5,000/day", emoji: "🚗" },
    ],
    bestTime: "April to October",
    weather: "Tropical — dry season Apr-Oct, wet season Nov-Mar",
    packingTips: ["Light summer clothes", "Sarong for temple visits", "Reef-safe sunscreen", "Rain jacket for wet season", "Comfortable sandals"],
    safetyTips: ["Wear helmet on scooters", "Don't touch temple offerings", "Beware of money changers — use ATMs", "Drink bottled water only"],
    etiquette: ["Wear sarong and sash at temples", "Don't point feet at altars", "Don't enter temples during menstruation", "Speak and move quietly at sacred sites"],
  },

  "turkey": {
    about: "Turkey is a transcontinental country bridging Europe and Asia, with Istanbul as its cultural heart. From the stunning landscapes of Cappadocia to the turquoise coast of the Aegean, Turkey offers ancient history, incredible food, and breathtaking scenery.",
    attractions: [
      { name: "Hagia Sophia", desc: "Iconic 6th century cathedral-turned-mosque", emoji: "🕌" },
      { name: "Cappadocia", desc: "Fairy chimneys and hot air balloon rides", emoji: "🎈" },
      { name: "Topkapi Palace", desc: "Ottoman imperial palace and museum", emoji: "🏰" },
      { name: "Pamukkale", desc: "White terraced hot spring pools", emoji: "♨️" },
      { name: "Grand Bazaar", desc: "One of the world's oldest covered markets", emoji: "🛍️" },
      { name: "Bosphorus Strait", desc: "Waterway between Europe and Asia", emoji: "🌉" },
    ],
    activities: [
      "Hot air balloon ride in Cappadocia",
      "Visit Hagia Sophia and Blue Mosque",
      "Bosphorus cruise in Istanbul",
      "Soak in Pamukkale hot springs",
      "Shop at Grand Bazaar",
      "Turkish bath (hammam) experience",
      "Ephesus ancient ruins tour",
      "Try authentic Turkish cuisine",
    ],
    transport: [
      { mode: "BY AIR", desc: "Istanbul Airport — fly from Dhaka", duration: "7-9 hours", cost: "৳35,000-70,000", emoji: "✈️" },
      { mode: "DOMESTIC FLIGHT", desc: "Turkish Airlines domestic network", duration: "1-2 hours", cost: "৳3,000-8,000", emoji: "✈️" },
      { mode: "METRO/TRAM", desc: "Istanbul's extensive public transport", duration: "Varies", cost: "৳150-400", emoji: "🚊" },
    ],
    bestTime: "April to May and September to October",
    weather: "Mediterranean to continental — warm summers, cold winters, mild spring/autumn",
    packingTips: ["Layers for varied weather", "Modest clothes for mosques", "Comfortable walking shoes", "Universal adapter", "Camera"],
    safetyTips: ["Register with your embassy", "Keep emergency contacts handy", "Use official taxis or apps", "Be aware of tourist scams in bazaars"],
    etiquette: ["Remove shoes at mosques", "Cover head and shoulders for women in mosques", "Don't eat or drink in mosques", "Bargaining expected in bazaars"],
  },

  "malaysia": {
    about: "Malaysia is a Southeast Asian country known for its beaches, rainforests, and mix of Malay, Chinese, and Indian cultures. Kuala Lumpur, the capital, is home to the iconic Petronas Towers, while Langkawi and Penang offer stunning islands and incredible food.",
    attractions: [
      { name: "Petronas Towers", desc: "Twin towers — once world's tallest buildings", emoji: "🏙️" },
      { name: "Langkawi Island", desc: "Duty-free island with beaches and cable car", emoji: "🏝️" },
      { name: "Batu Caves", desc: "Hindu temple inside limestone caves", emoji: "⛩️" },
      { name: "George Town Penang", desc: "UNESCO heritage city and food paradise", emoji: "🍜" },
      { name: "Cameron Highlands", desc: "Cool highland with tea plantations", emoji: "🍵" },
      { name: "Kinabalu Park", desc: "UNESCO rainforest with Mt. Kinabalu", emoji: "🏔️" },
    ],
    activities: [
      "Visit Petronas Towers sky bridge",
      "Langkawi cable car and eagle square",
      "Penang street food tour",
      "Batu Caves temple visit",
      "Cameron Highlands tea walk",
      "Rainforest trekking in Borneo",
      "Shopping at Bukit Bintang",
      "Kuala Lumpur city bus tour",
    ],
    transport: [
      { mode: "BY AIR", desc: "KLIA Airport Kuala Lumpur — fly from Dhaka", duration: "3-4 hours", cost: "৳18,000-40,000", emoji: "✈️" },
      { mode: "KTM/LRT", desc: "Kuala Lumpur rail network", duration: "Varies", cost: "৳100-400", emoji: "🚇" },
      { mode: "GRAB", desc: "Southeast Asia's ride-hailing app", duration: "Varies", cost: "৳200-1,000", emoji: "🚖" },
    ],
    bestTime: "March to October",
    weather: "Tropical — hot and humid year round, two monsoon seasons",
    packingTips: ["Light breathable clothes", "Modest clothes for temples", "Umbrella for sudden rain", "Comfortable shoes", "Insect repellent for jungle areas"],
    safetyTips: ["Drug trafficking carries death penalty", "Drink only bottled water", "Use official taxis or Grab", "Keep valuables secure"],
    etiquette: ["Remove shoes before entering homes and temples", "Use right hand for food and greetings", "Dress modestly at religious sites", "Don't touch someone's head"],
  },
};

// ─────────────────────────────────────────────
//  HOTEL DATABASES BY CITY
// ─────────────────────────────────────────────
const hotelDatabase = {
  "cox's bazar": [
    { id: 1, name: "Sea Pearl Beach Resort & Spa", tier: "Luxury", location: "Inani Beach, Ukhia", priceMin: 10000, priceMax: 20000, rating: 4.9, amenities: ["Beachfront", "Water Park", "Spa", "Infinity Pool", "Restaurants"], img: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400", bestFor: ["couple", "family"], rooms: [{ type: "Deluxe Sea View", price: 10000, guests: 2, beds: "1 King" }, { type: "Family Suite", price: 18000, guests: 4, beds: "2 King" }] },
    { id: 2, name: "Ocean Paradise Hotel & Resort", tier: "Luxury", location: "Kolatoli, Hotel Motel Zone", priceMin: 13000, priceMax: 22000, rating: 4.8, amenities: ["Rooftop Pool", "Gym", "Restaurant", "Sea View Rooms"], img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400", bestFor: ["couple", "family"], rooms: [{ type: "Standard Sea View", price: 13000, guests: 2, beds: "1 Queen" }, { type: "Penthouse Suite", price: 22000, guests: 2, beds: "1 King + Lounge" }] },
    { id: 3, name: "Sayeman Beach Resort", tier: "Luxury", location: "Marine Drive, Kolatoli Beach", priceMin: 10000, priceMax: 19000, rating: 4.8, amenities: ["Infinity Pool", "Beachfront Dining", "Premium Rooms"], img: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400", bestFor: ["couple", "family"], rooms: [{ type: "Beach View Room", price: 10000, guests: 2, beds: "1 Queen" }, { type: "Honeymoon Suite", price: 17000, guests: 2, beds: "1 King + Jacuzzi" }] },
    { id: 4, name: "Long Beach Hotel", tier: "Luxury", location: "14 Kalatoli Road", priceMin: 9500, priceMax: 18000, rating: 4.7, amenities: ["Rooftop Pool", "Business Facilities", "Large Rooms"], img: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400", bestFor: ["solo", "couple", "group"], rooms: [{ type: "Superior Room", price: 9500, guests: 2, beds: "1 Double" }, { type: "Family Room", price: 18000, guests: 4, beds: "2 Double" }] },
    { id: 5, name: "Seagull Hotel Ltd", tier: "Mid-Range", location: "Hotel Motel Zone", priceMin: 5000, priceMax: 10000, rating: 4.5, amenities: ["Beachfront", "Swimming Pool", "Spa"], img: "https://images.unsplash.com/photo-1455587734955-081b22074882?w=400", bestFor: ["solo", "couple", "family"], rooms: [{ type: "Standard Room", price: 5000, guests: 2, beds: "1 Double" }, { type: "Family Room", price: 10000, guests: 4, beds: "2 Double" }] },
    { id: 6, name: "Hotel Kollol", tier: "Mid-Range", location: "Laboni Beach Point", priceMin: 3000, priceMax: 5000, rating: 4.2, amenities: ["Beachfront", "Sea View Rooms", "Popular Tourist Hotel"], img: "https://images.unsplash.com/photo-1444201983204-c43cbd584d93?w=400", bestFor: ["solo", "couple"], rooms: [{ type: "Economy Room", price: 3000, guests: 1, beds: "1 Single" }, { type: "Sea View Room", price: 5000, guests: 2, beds: "1 Queen" }] },
    { id: 7, name: "Sampan Beach Resort", tier: "Unique/Cottage", location: "Marine Drive, Himchori", priceMin: 4500, priceMax: 9000, rating: 4.6, amenities: ["Eco Cottages", "Beachfront", "Quiet Environment"], img: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=400", bestFor: ["couple", "family", "solo"], rooms: [{ type: "Standard Cottage", price: 4500, guests: 2, beds: "1 Double" }, { type: "Family Cottage", price: 9000, guests: 5, beds: "2 Double + 1 Single" }] },
    { id: 8, name: "Hotel Sea Queen", tier: "Budget", location: "Jhawtala Main Road", priceMin: 1300, priceMax: 2500, rating: 3.8, amenities: ["Cheap Rooms", "City Area", "Basic Facilities"], img: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400", bestFor: ["solo", "group"], rooms: [{ type: "Single Room", price: 1300, guests: 1, beds: "1 Single" }, { type: "Triple Room", price: 2500, guests: 3, beds: "3 Single" }] },
  ],
  "dhaka": [
    { id: 101, name: "Pan Pacific Sonargaon", tier: "Luxury", location: "107 Kazi Nazrul Islam Avenue", priceMin: 15000, priceMax: 35000, rating: 4.8, amenities: ["Outdoor Pool", "Spa", "Multiple Restaurants", "Gym", "Business Center"], img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400", bestFor: ["solo", "couple", "group"], rooms: [{ type: "Deluxe Room", price: 15000, guests: 2, beds: "1 King" }, { type: "Executive Suite", price: 28000, guests: 2, beds: "1 King + Lounge" }] },
    { id: 102, name: "InterContinental Dhaka", tier: "Luxury", location: "1 Minto Road, Ramna", priceMin: 18000, priceMax: 40000, rating: 4.9, amenities: ["Rooftop Pool", "Spa", "Fine Dining", "Concierge", "Valet"], img: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400", bestFor: ["solo", "couple", "family"], rooms: [{ type: "Superior Room", price: 18000, guests: 2, beds: "1 Queen" }, { type: "Presidential Suite", price: 40000, guests: 4, beds: "2 King" }] },
    { id: 103, name: "The Westin Dhaka", tier: "Luxury", location: "Main Gulshan Avenue", priceMin: 14000, priceMax: 30000, rating: 4.8, amenities: ["Outdoor Pool", "Gym", "Fine Dining", "Spa"], img: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400", bestFor: ["solo", "couple", "family"], rooms: [{ type: "Deluxe Room", price: 14000, guests: 2, beds: "1 King" }, { type: "Suite", price: 25000, guests: 2, beds: "1 King + Living Room" }] },
    { id: 104, name: "Hotel 71", tier: "Mid-Range", location: "68/1 New Eskaton Road", priceMin: 5000, priceMax: 12000, rating: 4.4, amenities: ["Restaurant", "Gym", "Business Facilities", "Central Location"], img: "https://images.unsplash.com/photo-1455587734955-081b22074882?w=400", bestFor: ["solo", "couple", "group"], rooms: [{ type: "Standard Room", price: 5000, guests: 2, beds: "1 Double" }, { type: "Deluxe Room", price: 9000, guests: 2, beds: "1 King" }] },
    { id: 105, name: "Lakeshore Hotel", tier: "Mid-Range", location: "Gulshan-2, Dhaka", priceMin: 6000, priceMax: 14000, rating: 4.3, amenities: ["Lake View", "Restaurant", "Room Service", "Gym"], img: "https://images.unsplash.com/photo-1444201983204-c43cbd584d93?w=400", bestFor: ["solo", "couple", "family"], rooms: [{ type: "Standard Room", price: 6000, guests: 2, beds: "1 Double" }, { type: "Lake View Suite", price: 12000, guests: 2, beds: "1 King" }] },
    { id: 106, name: "Hotel Meridian", tier: "Budget", location: "Motijheel, Dhaka", priceMin: 2500, priceMax: 5000, rating: 3.9, amenities: ["Central Location", "AC Rooms", "Restaurant"], img: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400", bestFor: ["solo", "group"], rooms: [{ type: "Single Room", price: 2500, guests: 1, beds: "1 Single" }, { type: "Double Room", price: 4500, guests: 2, beds: "1 Double" }] },
  ],
  "sylhet": [
    { id: 201, name: "Grand Sultan Tea Resort & Golf", tier: "Luxury", location: "Sreemangal Road, Sylhet", priceMin: 12000, priceMax: 25000, rating: 4.9, amenities: ["Golf Course", "Tea Plantation", "Spa", "Fine Dining", "Pool"], img: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400", bestFor: ["couple", "family", "solo"], rooms: [{ type: "Deluxe Room", price: 12000, guests: 2, beds: "1 King" }, { type: "Golf View Suite", price: 22000, guests: 2, beds: "1 King + Balcony" }] },
    { id: 202, name: "Rose View Hotel", tier: "Luxury", location: "Airport Road, Sylhet", priceMin: 8000, priceMax: 18000, rating: 4.7, amenities: ["Rooftop Restaurant", "Pool", "Spa", "Tea Garden View"], img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400", bestFor: ["couple", "family", "solo"], rooms: [{ type: "Deluxe Room", price: 8000, guests: 2, beds: "1 King" }, { type: "Honeymoon Suite", price: 15000, guests: 2, beds: "1 King + Jacuzzi" }] },
    { id: 203, name: "Nazimgarh Gardenscape", tier: "Luxury", location: "Sitalakshya, Sylhet", priceMin: 9000, priceMax: 20000, rating: 4.8, amenities: ["Tea Garden Resort", "Nature Views", "Outdoor Activities", "Spa"], img: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400", bestFor: ["couple", "family"], rooms: [{ type: "Garden Villa", price: 9000, guests: 2, beds: "1 King" }, { type: "Family Bungalow", price: 18000, guests: 5, beds: "3 Beds" }] },
    { id: 204, name: "Hotel Star Pacific", tier: "Mid-Range", location: "Amberkhana, Sylhet", priceMin: 3500, priceMax: 7000, rating: 4.3, amenities: ["City Center", "Restaurant", "AC Rooms", "24hr Service"], img: "https://images.unsplash.com/photo-1455587734955-081b22074882?w=400", bestFor: ["solo", "couple", "group"], rooms: [{ type: "Standard Room", price: 3500, guests: 2, beds: "1 Double" }, { type: "Deluxe Room", price: 6000, guests: 2, beds: "1 King" }] },
  ],
  "chittagong": [
    { id: 301, name: "Radisson Blu Chattogram Bay View", tier: "Luxury", location: "1 Jamalkhan Road, Chittagong", priceMin: 10000, priceMax: 22000, rating: 4.8, amenities: ["Bay View", "Rooftop Pool", "Spa", "Fine Dining"], img: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400", bestFor: ["solo", "couple", "family"], rooms: [{ type: "Bay View Room", price: 10000, guests: 2, beds: "1 Queen" }, { type: "Executive Suite", price: 20000, guests: 2, beds: "1 King + Office" }] },
    { id: 302, name: "The Peninsula Chittagong", tier: "Luxury", location: "Agrabad, Chittagong", priceMin: 8000, priceMax: 18000, rating: 4.7, amenities: ["Sea View", "Pool", "Multiple Restaurants", "Spa"], img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400", bestFor: ["solo", "couple", "group"], rooms: [{ type: "Deluxe Room", price: 8000, guests: 2, beds: "1 King" }, { type: "Sea View Suite", price: 16000, guests: 2, beds: "1 King + Lounge" }] },
    { id: 303, name: "Hotel Agrabad", tier: "Mid-Range", location: "Agrabad Commercial Area", priceMin: 4000, priceMax: 9000, rating: 4.3, amenities: ["Business District", "Restaurant", "Gym"], img: "https://images.unsplash.com/photo-1455587734955-081b22074882?w=400", bestFor: ["solo", "group"], rooms: [{ type: "Standard Room", price: 4000, guests: 2, beds: "1 Double" }, { type: "Deluxe Room", price: 8000, guests: 2, beds: "1 King" }] },
  ],
  "bandarban": [
    { id: 401, name: "Nilgiri Resort", tier: "Luxury", location: "Nilgiri Hills, Bandarban", priceMin: 8000, priceMax: 18000, rating: 4.8, amenities: ["Cloud Level Views", "Restaurant", "Bonfire", "Army Managed", "Trekking"], img: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=400", bestFor: ["couple", "family", "group"], rooms: [{ type: "Cottage", price: 8000, guests: 2, beds: "1 Double" }, { type: "Family Cottage", price: 16000, guests: 4, beds: "2 Double" }] },
    { id: 402, name: "Sajek Valley Resort", tier: "Mid-Range", location: "Sajek, Bandarban", priceMin: 3500, priceMax: 8000, rating: 4.7, amenities: ["Cloud View", "Sunrise View", "Bonfire", "Eco Cottages"], img: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=400", bestFor: ["couple", "family", "group"], rooms: [{ type: "Standard Cottage", price: 3500, guests: 2, beds: "1 Double" }, { type: "Premium Cottage", price: 7500, guests: 4, beds: "2 Double" }] },
    { id: 403, name: "Hotel Hillbird", tier: "Mid-Range", location: "Bandarban Sadar", priceMin: 3000, priceMax: 7000, rating: 4.5, amenities: ["Hill View", "Restaurant", "Trekking Guide"], img: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400", bestFor: ["solo", "couple", "group"], rooms: [{ type: "Hill View Room", price: 3000, guests: 2, beds: "1 Double" }, { type: "Deluxe Room", price: 6000, guests: 2, beds: "1 King" }] },
    { id: 404, name: "Hotel Purbani", tier: "Budget", location: "Bandarban Town", priceMin: 1500, priceMax: 3500, rating: 3.8, amenities: ["Budget Friendly", "Town Center"], img: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400", bestFor: ["solo", "group"], rooms: [{ type: "Single Room", price: 1500, guests: 1, beds: "1 Single" }, { type: "Double Room", price: 3000, guests: 2, beds: "1 Double" }] },
  ],
  "rangamati": [
    { id: 501, name: "Hotel Sufia International", tier: "Mid-Range", location: "Reserve Bazar, Rangamati", priceMin: 3000, priceMax: 7000, rating: 4.3, amenities: ["Lake View", "Restaurant", "Boat Rental"], img: "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=400", bestFor: ["solo", "couple", "group"], rooms: [{ type: "Standard Room", price: 3000, guests: 2, beds: "1 Double" }, { type: "Lake View Room", price: 6000, guests: 2, beds: "1 King" }] },
    { id: 502, name: "Parjatan Holiday Complex", tier: "Mid-Range", location: "Rangamati Lake Shore", priceMin: 2500, priceMax: 6000, rating: 4.1, amenities: ["Lakefront", "Boat Trips", "Restaurant", "Garden"], img: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400", bestFor: ["family", "group"], rooms: [{ type: "Standard Cabin", price: 2500, guests: 2, beds: "1 Double" }, { type: "Family Cabin", price: 5500, guests: 4, beds: "2 Double" }] },
    { id: 503, name: "Hotel Green Castle", tier: "Budget", location: "Rangamati Town", priceMin: 2000, priceMax: 4000, rating: 3.9, amenities: ["Budget Friendly", "AC Rooms", "Near Lake"], img: "https://images.unsplash.com/photo-1444201983204-c43cbd584d93?w=400", bestFor: ["solo", "couple"], rooms: [{ type: "Standard Room", price: 2000, guests: 2, beds: "1 Double" }, { type: "Deluxe Room", price: 3500, guests: 2, beds: "1 Queen" }] },
  ],
  "khulna": [
    { id: 601, name: "Sundarban Tiger Garden", tier: "Luxury", location: "Mongla, Near Sundarbans", priceMin: 8000, priceMax: 18000, rating: 4.7, amenities: ["Jungle Resort", "Boat Tours", "Wildlife Guides", "Eco Friendly"], img: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400", bestFor: ["couple", "family", "group"], rooms: [{ type: "Forest Cottage", price: 8000, guests: 2, beds: "1 Double" }, { type: "Family Bungalow", price: 16000, guests: 4, beds: "2 Double" }] },
    { id: 602, name: "Hotel Royal International", tier: "Luxury", location: "KDA Avenue, Khulna", priceMin: 5000, priceMax: 12000, rating: 4.5, amenities: ["Restaurant", "Gym", "Business Center", "Modern Rooms"], img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400", bestFor: ["solo", "couple", "group"], rooms: [{ type: "Deluxe Room", price: 5000, guests: 2, beds: "1 King" }, { type: "Suite", price: 11000, guests: 2, beds: "1 King + Lounge" }] },
    { id: 603, name: "Hotel Kha'Nia Sunshine", tier: "Mid-Range", location: "Khulna City Center", priceMin: 3000, priceMax: 7000, rating: 4.2, amenities: ["City Center", "Restaurant", "AC Rooms"], img: "https://images.unsplash.com/photo-1455587734955-081b22074882?w=400", bestFor: ["solo", "couple", "group"], rooms: [{ type: "Standard Room", price: 3000, guests: 2, beds: "1 Double" }, { type: "Deluxe Room", price: 6000, guests: 2, beds: "1 King" }] },
  ],
  "maldives": [
    { id: 701, name: "Soneva Fushi", tier: "Ultra Luxury", location: "Baa Atoll, Maldives", priceMin: 150000, priceMax: 500000, rating: 4.9, amenities: ["Private Beach", "Overwater Villa", "Spa", "Fine Dining", "Snorkeling"], img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400", bestFor: ["couple", "family"], rooms: [{ type: "Jungle Villa", price: 150000, guests: 2, beds: "1 King" }, { type: "Overwater Suite", price: 400000, guests: 2, beds: "1 King + Pool" }] },
    { id: 702, name: "Kandima Maldives", tier: "Luxury", location: "Dhaalu Atoll, Maldives", priceMin: 50000, priceMax: 150000, rating: 4.7, amenities: ["1.8km Beach", "10 Restaurants", "Spa", "Water Sports", "Pool"], img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400", bestFor: ["couple", "family", "group"], rooms: [{ type: "Sky Studio", price: 50000, guests: 2, beds: "1 King" }, { type: "Aqua Villa", price: 130000, guests: 2, beds: "1 King + Overwater Deck" }] },
    { id: 703, name: "Cinnamon Hakuraa Huraa", tier: "Mid-Range", location: "Meemu Atoll, Maldives", priceMin: 25000, priceMax: 60000, rating: 4.4, amenities: ["Overwater Bungalows", "Snorkeling", "Restaurant", "Beach Bar"], img: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400", bestFor: ["couple", "family"], rooms: [{ type: "Beach Bungalow", price: 25000, guests: 2, beds: "1 Double" }, { type: "Overwater Bungalow", price: 55000, guests: 2, beds: "1 King" }] },
  ],
  "thailand": [
    { id: 801, name: "Mandarin Oriental Bangkok", tier: "Luxury", location: "48 Oriental Avenue, Bangkok", priceMin: 30000, priceMax: 80000, rating: 4.9, amenities: ["Riverside", "Spa", "Fine Dining", "Pool", "Heritage Hotel"], img: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=400", bestFor: ["couple", "solo"], rooms: [{ type: "Superior Room", price: 30000, guests: 2, beds: "1 King" }, { type: "River Suite", price: 75000, guests: 2, beds: "1 King + Lounge" }] },
    { id: 802, name: "Anantara Riverside Bangkok", tier: "Luxury", location: "257/1-3 Charoennakorn Road, Bangkok", priceMin: 20000, priceMax: 50000, rating: 4.7, amenities: ["River View", "Multiple Pools", "Spa", "5 Restaurants"], img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400", bestFor: ["couple", "family"], rooms: [{ type: "Deluxe Room", price: 20000, guests: 2, beds: "1 King" }, { type: "Suite", price: 45000, guests: 2, beds: "1 King + Living" }] },
    { id: 803, name: "Ibis Bangkok Sukhumvit", tier: "Budget", location: "Sukhumvit Soi 4, Bangkok", priceMin: 4000, priceMax: 8000, rating: 4.2, amenities: ["Central Location", "Modern Rooms", "Restaurant", "Near BTS"], img: "https://images.unsplash.com/photo-1506059612708-99d6c258160e?w=400", bestFor: ["solo", "couple", "group"], rooms: [{ type: "Standard Room", price: 4000, guests: 2, beds: "1 Double" }, { type: "Superior Room", price: 7000, guests: 2, beds: "1 King" }] },
  ],
  "dubai": [
    { id: 901, name: "Atlantis The Palm", tier: "Luxury", location: "Palm Jumeirah, Dubai", priceMin: 35000, priceMax: 150000, rating: 4.7, amenities: ["Aquaventure Water Park", "Private Beach", "Aquarium", "23 Restaurants"], img: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400", bestFor: ["family", "couple", "group"], rooms: [{ type: "Deluxe Room", price: 35000, guests: 2, beds: "1 King" }, { type: "Neptune Suite", price: 120000, guests: 2, beds: "1 King + Aquarium View" }] },
    { id: 902, name: "JW Marriott Marquis Dubai", tier: "Luxury", location: "Sheikh Zayed Road, Dubai", priceMin: 20000, priceMax: 60000, rating: 4.8, amenities: ["Tallest Hotel", "Multiple Pools", "Spa", "Fine Dining", "City View"], img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400", bestFor: ["solo", "couple", "group"], rooms: [{ type: "Deluxe Room", price: 20000, guests: 2, beds: "1 King" }, { type: "Executive Suite", price: 55000, guests: 2, beds: "1 King + Lounge" }] },
    { id: 903, name: "Rove Downtown Dubai", tier: "Budget", location: "Sheikh Mohammed Bin Rashid Blvd", priceMin: 8000, priceMax: 16000, rating: 4.4, amenities: ["Near Burj Khalifa", "Pool", "Modern Design"], img: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400", bestFor: ["solo", "couple", "group"], rooms: [{ type: "Standard Room", price: 8000, guests: 2, beds: "1 Double" }, { type: "Superior Room", price: 14000, guests: 2, beds: "1 King" }] },
  ],
  "singapore": [
    { id: 1001, name: "Marina Bay Sands", tier: "Luxury", location: "10 Bayfront Avenue, Singapore", priceMin: 45000, priceMax: 120000, rating: 4.8, amenities: ["Infinity Pool", "Casino", "Skypark", "Fine Dining", "Shops"], img: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=400", bestFor: ["couple", "solo", "group"], rooms: [{ type: "Deluxe Room", price: 45000, guests: 2, beds: "1 King" }, { type: "Suite", price: 100000, guests: 2, beds: "1 King + Living Room" }] },
    { id: 1002, name: "Raffles Hotel Singapore", tier: "Ultra Luxury", location: "1 Beach Road, Singapore", priceMin: 80000, priceMax: 250000, rating: 4.9, amenities: ["Heritage Hotel", "Spa", "Fine Dining", "Butler Service"], img: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400", bestFor: ["couple", "solo"], rooms: [{ type: "State Room", price: 80000, guests: 2, beds: "1 King" }, { type: "Grand Hotel Suite", price: 200000, guests: 2, beds: "1 King + Living" }] },
    { id: 1003, name: "Ibis Budget Singapore", tier: "Budget", location: "Clarke Quay, Singapore", priceMin: 8000, priceMax: 15000, rating: 4.1, amenities: ["Central Location", "Near MRT", "Modern Rooms"], img: "https://images.unsplash.com/photo-1455587734955-081b22074882?w=400", bestFor: ["solo", "couple", "group"], rooms: [{ type: "Standard Room", price: 8000, guests: 2, beds: "1 Double" }, { type: "Superior Room", price: 13000, guests: 2, beds: "1 King" }] },
  ],
  "nepal": [
    { id: 1101, name: "Dwarika's Hotel", tier: "Luxury", location: "Battisputali, Kathmandu", priceMin: 25000, priceMax: 60000, rating: 4.9, amenities: ["Heritage Hotel", "Spa", "Fine Dining", "Cultural Experience"], img: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400", bestFor: ["couple", "solo"], rooms: [{ type: "Courtyard Room", price: 25000, guests: 2, beds: "1 Double" }, { type: "Heritage Suite", price: 55000, guests: 2, beds: "1 King + Lounge" }] },
    { id: 1102, name: "Hotel Yak & Yeti", tier: "Luxury", location: "Durbar Marg, Kathmandu", priceMin: 15000, priceMax: 40000, rating: 4.7, amenities: ["Pool", "Casino", "Spa", "Multiple Restaurants", "Garden"], img: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=400", bestFor: ["solo", "couple", "group"], rooms: [{ type: "Superior Room", price: 15000, guests: 2, beds: "1 Queen" }, { type: "Royal Suite", price: 38000, guests: 2, beds: "1 King + Living" }] },
    { id: 1103, name: "Thamel Eco Resort", tier: "Mid-Range", location: "Thamel, Kathmandu", priceMin: 5000, priceMax: 12000, rating: 4.4, amenities: ["Eco Friendly", "Trekking Info", "Restaurant", "Garden"], img: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400", bestFor: ["solo", "couple", "group"], rooms: [{ type: "Standard Room", price: 5000, guests: 2, beds: "1 Double" }, { type: "Deluxe Room", price: 10000, guests: 2, beds: "1 King" }] },
  ],
  "bali": [
    { id: 1201, name: "Four Seasons Resort Bali", tier: "Ultra Luxury", location: "Sayan, Ubud, Bali", priceMin: 80000, priceMax: 250000, rating: 5.0, amenities: ["Rice Terrace View", "Jungle Pool", "Spa", "Fine Dining", "Villa"], img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400", bestFor: ["couple", "solo"], rooms: [{ type: "River Suite", price: 80000, guests: 2, beds: "1 King" }, { type: "Villa", price: 200000, guests: 4, beds: "2 King + Pool" }] },
    { id: 1202, name: "Alaya Resort Ubud", tier: "Luxury", location: "Jalan Hanoman, Ubud", priceMin: 20000, priceMax: 60000, rating: 4.7, amenities: ["Jungle View", "Infinity Pool", "Spa", "Yoga", "Restaurant"], img: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400", bestFor: ["couple", "solo"], rooms: [{ type: "Deluxe Room", price: 20000, guests: 2, beds: "1 King" }, { type: "Suite", price: 55000, guests: 2, beds: "1 King + Pool" }] },
    { id: 1203, name: "Kuta Seaview Boutique Resort", tier: "Mid-Range", location: "Kuta Beach, Bali", priceMin: 8000, priceMax: 20000, rating: 4.4, amenities: ["Beach Access", "Pool", "Restaurant", "Surf Lessons"], img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400", bestFor: ["solo", "couple", "group"], rooms: [{ type: "Standard Room", price: 8000, guests: 2, beds: "1 Double" }, { type: "Sea View Room", price: 18000, guests: 2, beds: "1 King" }] },
  ],
  "turkey": [
    { id: 1301, name: "Ciragan Palace Kempinski", tier: "Ultra Luxury", location: "Besiktas, Istanbul", priceMin: 60000, priceMax: 200000, rating: 4.9, amenities: ["Bosphorus View", "Ottoman Palace", "Pool", "Spa", "Fine Dining"], img: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=400", bestFor: ["couple", "solo"], rooms: [{ type: "Superior Room", price: 60000, guests: 2, beds: "1 King" }, { type: "Palace Suite", price: 180000, guests: 2, beds: "1 King + Lounge" }] },
    { id: 1302, name: "Novotel Istanbul Bosphorus", tier: "Mid-Range", location: "Gümüssuyu, Istanbul", priceMin: 12000, priceMax: 30000, rating: 4.5, amenities: ["Bosphorus View", "Pool", "Restaurant", "Modern Rooms"], img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400", bestFor: ["solo", "couple", "group"], rooms: [{ type: "Standard Room", price: 12000, guests: 2, beds: "1 Double" }, { type: "Superior Room", price: 25000, guests: 2, beds: "1 King" }] },
  ],
  "malaysia": [
    { id: 1401, name: "Mandarin Oriental Kuala Lumpur", tier: "Luxury", location: "Kuala City Centre, KL", priceMin: 25000, priceMax: 70000, rating: 4.8, amenities: ["KLCC View", "Pool", "Spa", "Fine Dining", "Near Petronas"], img: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=400", bestFor: ["solo", "couple", "group"], rooms: [{ type: "Deluxe Room", price: 25000, guests: 2, beds: "1 King" }, { type: "Twin Towers Suite", price: 65000, guests: 2, beds: "1 King + Lounge" }] },
    { id: 1402, name: "The Ritz-Carlton Langkawi", tier: "Luxury", location: "Jalan Pantai Kok, Langkawi", priceMin: 30000, priceMax: 90000, rating: 4.9, amenities: ["Rainforest Setting", "Private Pool", "Spa", "Beach Access"], img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400", bestFor: ["couple", "family"], rooms: [{ type: "Deluxe Room", price: 30000, guests: 2, beds: "1 King" }, { type: "Villa", price: 85000, guests: 4, beds: "2 King + Pool" }] },
    { id: 1403, name: "Ibis Styles Kuala Lumpur", tier: "Budget", location: "Jalan Tuanku Abdul Halim, KL", priceMin: 5000, priceMax: 12000, rating: 4.2, amenities: ["City Center", "Near MRT", "Modern Rooms"], img: "https://images.unsplash.com/photo-1444201983204-c43cbd584d93?w=400", bestFor: ["solo", "couple", "group"], rooms: [{ type: "Standard Room", price: 5000, guests: 2, beds: "1 Double" }, { type: "Superior Room", price: 10000, guests: 2, beds: "1 King" }] },
  ],
};

// ─────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────
function getDestinationKey(destination) {
  const key = destination.toLowerCase().trim();
  if (hotelDatabase[key]) return key;
  for (const city of Object.keys(hotelDatabase)) {
    if (key.includes(city) || city.includes(key)) return city;
  }
  return "cox's bazar";
}

function getHotelsForDestination(destination) {
  return hotelDatabase[getDestinationKey(destination)] || hotelDatabase["cox's bazar"];
}

function filterHotels(destination, budgetMax, travelType, duration) {
  const hotels = getHotelsForDestination(destination);
  const nightlyBudget = Math.floor(budgetMax / duration);
  const filtered = hotels
    .filter(h => h.priceMin <= nightlyBudget && h.bestFor.includes(travelType))
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 6)
    .map(hotel => {
      const suitable = hotel.rooms.filter(r => r.price <= nightlyBudget);
      return { ...hotel, recommendedRoom: suitable[0] || hotel.rooms[0] };
    });
  if (filtered.length === 0) {
    return hotels.slice(0, 3).map(h => ({ ...h, recommendedRoom: h.rooms[0] }));
  }
  return filtered;
}

// ─────────────────────────────────────────────
//  AI
// ─────────────────────────────────────────────
async function callAI(prompt) {
  if (USE_GROQ) {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_API_KEY}` },
      body: JSON.stringify({ model: 'llama3-8b-8192', messages: [{ role: 'user', content: prompt }], temperature: 0.7, max_tokens: 2000 }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Groq error');
    return data.choices[0].message.content;
  } else {
    const res = await fetch(`${LM_STUDIO_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'local-model', messages: [{ role: 'user', content: prompt }], temperature: 0.7, max_tokens: 2000 }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'LM Studio error');
    return data.choices[0].message.content;
  }
}

function buildItineraryPrompt({ destination, duration, travelType, budgetMin, budgetMax, hotelName, selectedActivities, startDate, endDate }) {
  const labels = { solo: 'Solo Traveler', couple: 'Couple', family: 'Family', group: 'Group' };
  return `
You are an expert travel planner. Generate a detailed day-by-day itinerary.

TRIP DETAILS:
- Destination: ${destination}
- Duration: ${duration} days
- Travel Type: ${labels[travelType] || travelType}
- Budget: ৳${Number(budgetMin).toLocaleString()} – ৳${Number(budgetMax).toLocaleString()} total
- Selected Hotel: ${hotelName}
- Selected Activities: ${selectedActivities.join(', ')}
- Travel Dates: ${startDate || 'Not specified'} to ${endDate || 'Not specified'}

Return ONLY this JSON, no markdown, no extra text:
{
  "overview": "2-3 sentence trip summary",
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
  "budgetBreakdown": {
    "hotel": 15000,
    "food": 8000,
    "transport": 3000,
    "activities": 4000,
    "total": 30000
  },
  "tips": [
    { "category": "Best Time to Visit", "tip": "..." },
    { "category": "What to Pack", "tip": "..." },
    { "category": "Safety Tips", "tip": "..." },
    { "category": "Local Etiquette", "tip": "..." },
    { "category": "Travel Tips & Advice", "tip": "..." }
  ]
}

Rules:
- Use real spots and landmarks in ${destination}
- Include activities from the selected list: ${selectedActivities.join(', ')}
- Personalize for ${labels[travelType] || travelType}
- Hotel cost = hotel nightly price x ${duration} nights — use realistic prices
- Keep total budget within ৳${Number(budgetMin).toLocaleString()} – ৳${Number(budgetMax).toLocaleString()}
- Return ONLY valid JSON
`.trim();
}

function fallbackItinerary(destination, duration, travelType, selectedActivities) {
  const days = Array.from({ length: Math.min(duration, 7) }, (_, i) => ({
    day: i + 1,
    title: i === 0 ? `Arrival & Explore ${destination}` : i === duration - 1 ? 'Departure Day' : `Day ${i + 1} Exploration`,
    theme: i === 0 ? 'Arrival' : i % 2 === 0 ? 'Sightseeing' : 'Culture & Food',
    activities: [
      { time: '8:00 AM', activity: 'Breakfast', description: 'Hotel breakfast', type: 'food' },
      { time: '10:00 AM', activity: selectedActivities[i % selectedActivities.length] || `Explore ${destination}`, description: 'Enjoy the experience', type: 'attraction' },
      { time: '1:00 PM', activity: `Lunch at local restaurant`, description: 'Try local cuisine', type: 'food' },
      { time: '3:00 PM', activity: `Explore ${destination}`, description: 'Relax and discover', type: 'leisure' },
      { time: '7:00 PM', activity: 'Dinner', description: 'Enjoy local food', type: 'food' },
    ],
    estimatedDailyCost: 4500,
  }));
  return {
    overview: `A ${duration}-day trip to ${destination}. Explore the best this destination has to offer.`,
    days,
    budgetBreakdown: { hotel: duration * 4000, food: duration * 1500, transport: 3000, activities: 2000, total: duration * 5500 + 5000 },
    tips: [
      { category: 'Best Time to Visit', tip: `Research the best season to visit ${destination}.` },
      { category: 'What to Pack', tip: 'Pack light, breathable clothes and comfortable walking shoes.' },
      { category: 'Safety Tips', tip: 'Keep valuables secure and stay in well-lit areas at night.' },
      { category: 'Local Etiquette', tip: 'Respect local customs and dress codes.' },
      { category: 'Travel Tips & Advice', tip: 'Exchange currency at official exchange points for best rates.' },
    ],
  };
}

// ─────────────────────────────────────────────
//  ROUTES
// ─────────────────────────────────────────────

// GET /api/trip/destination-info
router.get('/destination-info', (req, res) => {
  const { destination } = req.query;
  if (!destination) return res.status(400).json({ error: 'destination required' });
  const key = getDestinationKey(destination);
  const info = destinationInfo[key];
  if (!info) return res.json({ success: true, info: null, hotels: getHotelsForDestination(destination) });
  res.json({ success: true, info, hotels: hotelDatabase[key] || [] });
});

// GET /api/trip/cities
router.get('/cities', (req, res) => {
  res.json({ success: true, cities: Object.keys(hotelDatabase) });
});

// POST /api/trip/generate-itinerary
router.post('/generate-itinerary', async (req, res) => {
  const { destination, duration, travelType, budgetMin, budgetMax, hotelName, selectedActivities, startDate, endDate } = req.body;
  if (!destination || !duration || !travelType || !hotelName) {
    return res.status(400).json({ error: 'destination, duration, travelType, and hotelName are required.' });
  }
  try {
    let aiPlan;
    try {
      const raw = await callAI(buildItineraryPrompt({ destination, duration: Number(duration), travelType, budgetMin, budgetMax, hotelName, selectedActivities: selectedActivities || [], startDate, endDate }));
      const cleaned = raw.replace(/```json|```/g, '').trim();
      aiPlan = JSON.parse(cleaned);
    } catch (aiErr) {
      console.error('AI failed, using fallback:', aiErr.message);
      aiPlan = fallbackItinerary(destination, Number(duration), travelType, selectedActivities || []);
    }
    res.json({ success: true, itinerary: aiPlan });
  } catch (err) {
    console.error('Generate itinerary error:', err);
    res.status(500).json({ error: 'Failed to generate itinerary.' });
  }
});

// POST /api/trip/save — save confirmed trip to DB
router.post('/save', authMiddleware, async (req, res) => {
  const { destination, duration, travelType, budgetMin, budgetMax, startDate, endDate, hotel, activities, itinerary, budgetBreakdown, overview, tips } = req.body;
  if (!destination || !duration || !travelType) {
    return res.status(400).json({ error: 'destination, duration, and travelType are required.' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO trips (user_id, destination, duration, travel_type, budget_min, budget_max, start_date, end_date, hotel, activities, itinerary, budget_breakdown, overview, tips, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,'upcoming') RETURNING *`,
      [req.user.id, destination, Number(duration), travelType, Number(budgetMin) || 0, Number(budgetMax) || 50000,
        startDate || null, endDate || null,
        JSON.stringify(hotel || {}), JSON.stringify(activities || []),
        JSON.stringify(itinerary || {}), JSON.stringify(budgetBreakdown || {}),
        overview || '', JSON.stringify(tips || [])]
    );
    res.status(201).json({ success: true, trip: result.rows[0] });
  } catch (err) {
    console.error('Save trip error:', err);
    res.status(500).json({ error: 'Failed to save trip.' });
  }
});

// GET /api/trip/my-trips — get user's saved trips
router.get('/my-trips', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM trips WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json({ success: true, trips: result.rows });
  } catch (err) {
    console.error('Get trips error:', err);
    res.status(500).json({ error: 'Failed to fetch trips.' });
  }
});

// DELETE /api/trip/:id — delete a trip
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM trips WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete trip.' });
  }
});

module.exports = router;