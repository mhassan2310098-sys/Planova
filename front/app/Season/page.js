'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const activities = [
  { id: 'beach',     label: 'Beach & Water Sports', emoji: '🏖️' },
  { id: 'hiking',    label: 'Hiking & Trekking',     emoji: '🥾' },
  { id: 'cultural',  label: 'Cultural Tours',         emoji: '🏛️' },
  { id: 'wildlife',  label: 'Wildlife Safari',        emoji: '🐯' },
  { id: 'photography', label: 'Photography',          emoji: '📸' },
  { id: 'food',      label: 'Food & Cuisine',         emoji: '🍜' },
];

const months = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

const travelStyles = [
  'Adventure','Relaxation','Cultural Immersion',
  'Budget Backpacking','Luxury','Family','Solo','Romantic',
];

const budgetRanges = [
  { value: '',            label: 'Any budget' },
  { value: '0-10000',     label: 'Under ৳10,000' },
  { value: '10000-25000', label: '৳10,000 – ৳25,000' },
  { value: '25000-50000', label: '৳25,000 – ৳50,000' },
  { value: '50000-100000',label: '৳50,000 – ৳1,00,000' },
  { value: '100000+',     label: '৳1,00,000+' },
];

// Destinations the backend already knows about
const knownDestinations = [
  "Cox's Bazar", 'Dhaka', 'Sylhet', 'Chittagong',
  'Bandarban', 'Rangamati', 'Khulna',
  'Maldives', 'Thailand', 'Dubai', 'Singapore', 'Nepal', 'Bali', 'Turkey', 'Malaysia',
];

export default function SeasonRecommendationsPage() {
  const router = useRouter();

  const [selectedMonth,      setSelectedMonth]      = useState('');
  const [travelStyle,        setTravelStyle]        = useState('');
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [budget,             setBudget]             = useState('');
  const [error,              setError]              = useState('');
  const [loading,            setLoading]            = useState(false);
  const [results,            setResults]            = useState(null);

  const toggleActivity = (id) => {
    setSelectedActivities(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  // ── Build prompt for AI ──────────────────────────────────────────────
  const buildPrompt = () => {
    const activityLabels = selectedActivities.map(id => activities.find(a => a.id === id)?.label).join(', ');
    const budgetLabel    = budgetRanges.find(b => b.value === budget)?.label || 'Any budget';

    return `
You are a travel expert for Bangladesh-based travelers. Recommend destinations based on the user's preferences.

USER PREFERENCES:
- Travel Month: ${selectedMonth}
- Travel Style: ${travelStyle}
- Interests/Activities: ${activityLabels}
- Budget: ${budgetLabel}

Available destinations you know well: ${knownDestinations.join(', ')}

Return ONLY this JSON, no markdown, no extra text:
{
  "summary": "2-sentence personalized intro based on their month and style",
  "recommendations": [
    {
      "destination": "Destination Name",
      "country": "Country",
      "matchScore": 95,
      "whyNow": "Why ${selectedMonth} is great for this destination (1 sentence)",
      "highlights": ["highlight 1", "highlight 2", "highlight 3"],
      "bestFor": "${travelStyle} travelers",
      "estimatedBudget": "৳X,XXX – ৳X,XXX per person",
      "weather": "Brief weather description for ${selectedMonth}",
      "topActivity": "Best activity matching their interests"
    }
  ],
  "seasonalTip": "One practical travel tip for ${selectedMonth} travel"
}

Rules:
- Return exactly 4 recommendations
- Prioritize destinations from the known list that match the month's weather patterns
- Match activities to destination strengths
- matchScore should be 70-98 based on actual fit
- Keep estimatedBudget realistic for Bangladeshi travelers
- Return ONLY valid JSON
`.trim();
  };

  // ── Submit ───────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!selectedMonth || !travelStyle || selectedActivities.length === 0) {
      setError('Please fill in all required fields and select at least one activity.');
      return;
    }
    setError('');
    setLoading(true);
    setResults(null);

    try {
      // Call your existing AI endpoint pattern — we POST to a new endpoint
      // But since /trip/generate-itinerary already calls callAI(),
      // we'll use the same underlying AI via a simple fetch to that route
      // and parse just the recommendations.
      // Alternatively, call the AI directly via the same mechanism.

      // We'll call a dedicated recommendations endpoint if it exists,
      // otherwise fall back to client-side static logic with enrichment.

      // Try calling backend for AI recommendations
      const res = await fetch(`${API}/trip/season-recommendations`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ month: selectedMonth, travelStyle, activities: selectedActivities, budget }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.recommendations) {
          setResults(json);
          setLoading(false);
          return;
        }
      }
    } catch (_) {
      // fall through to static logic
    }

    // ── Static fallback (no new backend route needed) ──
    // Map months to good destinations
    const monthDestMap = {
      'October':  ["Cox's Bazar", 'Sylhet', 'Bandarban', 'Nepal'],
      'November': ["Cox's Bazar", 'Khulna', 'Rangamati', 'Thailand'],
      'December': ["Cox's Bazar", 'Sylhet', 'Bandarban', 'Dubai'],
      'January':  ['Sylhet', 'Khulna', 'Chittagong', 'Maldives'],
      'February': ["Cox's Bazar", 'Rangamati', 'Bali', 'Malaysia'],
      'March':    ['Dhaka', 'Chittagong', 'Thailand', 'Nepal'],
      'April':    ['Sylhet', 'Bandarban', 'Singapore', 'Turkey'],
      'May':      ['Sylhet', 'Rangamati', 'Turkey', 'Malaysia'],
      'June':     ['Dhaka', 'Khulna', 'Singapore', 'Dubai'],
      'July':     ['Dhaka', 'Chittagong', 'Dubai', 'Singapore'],
      'August':   ['Dhaka', 'Khulna', 'Dubai', 'Malaysia'],
      'September':['Bandarban', 'Rangamati', 'Nepal', 'Bali'],
    };

    const destDetails = {
      "Cox's Bazar":{ country:'Bangladesh', weather:'Sunny & dry — perfect beach weather', budget:'৳8,000 – ৳25,000', activity:'Swimming & sunbathing at the world\'s longest beach', highlights:['World\'s longest natural sea beach','Himchari waterfall hike','Fresh seafood dining'] },
      'Sylhet':     { country:'Bangladesh', weather:'Misty mornings, cool & pleasant',       budget:'৳6,000 – ₹20,000', activity:'Tea garden walks & boat tours in Ratargul', highlights:['Ratargul swamp forest','Tea garden walks','7-layer tea at Srimangal'] },
      'Bandarban':  { country:'Bangladesh', weather:'Cool & clear — ideal for trekking',     budget:'৳5,000 – ৳18,000', activity:'Sunrise trek to Nilgiri peak', highlights:['Nilgiri hilltop at sunrise','Nafakhum waterfall','Tribal community visits'] },
      'Rangamati':  { country:'Bangladesh', weather:'Pleasant & mild',                        budget:'৳4,000 – ৳15,000', activity:'Boat tour on Kaptai Lake', highlights:['Kaptai Lake boat rides','Shuvolong waterfall','Tribal craft markets'] },
      'Khulna':     { country:'Bangladesh', weather:'Cool — best time for Sundarbans',       budget:'৳7,000 – ৳22,000', activity:'Royal Bengal Tiger safari in Sundarbans', highlights:['Sundarbans boat safari','Sixty Dome Mosque Bagerhat','Mongla port sunset'] },
      'Chittagong': { country:'Bangladesh', weather:'Pleasant coastal weather',               budget:'৳5,000 – ৳18,000', activity:'Patenga beach sunset & hill hikes', highlights:['Patenga beach at sunset','Chandranath Hill temple','Foy\'s Lake'] },
      'Dhaka':      { country:'Bangladesh', weather:'Mild & comfortable',                    budget:'৳4,000 – ৳15,000', activity:'Old Dhaka street food & heritage tour', highlights:['Lalbagh Fort & Ahsan Manzil','Old Dhaka food tour','Sadarghat boat ride'] },
      'Maldives':   { country:'Maldives',   weather:'Dry season — crystal clear water',      budget:'৳60,000 – ৳2,00,000', activity:'Snorkeling with manta rays & whale sharks', highlights:['Overwater villa stay','Coral reef snorkeling','Bioluminescent beach'] },
      'Thailand':   { country:'Thailand',   weather:'Cool & dry — peak season',             budget:'৳30,000 – ৳80,000', activity:'Temple hopping & Bangkok street food tour', highlights:['Grand Palace Bangkok','Phi Phi Islands','Elephant sanctuary Chiang Mai'] },
      'Dubai':      { country:'UAE',        weather:'Pleasant & warm — ideal outdoor weather',budget:'৳50,000 – ৳1,50,000', activity:'Desert safari & Burj Khalifa observation deck', highlights:['Desert dune bashing','Burj Khalifa at night','Dubai Creek dinner cruise'] },
      'Singapore':  { country:'Singapore', weather:'Warm — indoor attractions shine',        budget:'৳40,000 – ৳1,20,000', activity:'Gardens by the Bay & hawker food tour', highlights:['Gardens by the Bay','Universal Studios','Hawker centre food crawl'] },
      'Nepal':      { country:'Nepal',      weather:'Clear skies — best for trekking & views',budget:'৳20,000 – ৳60,000', activity:'Everest Base Camp trek or mountain flight', highlights:['Himalayan mountain views','Pashupatinath temple','Pokhara paragliding'] },
      'Bali':       { country:'Indonesia',  weather:'Dry season — lush and green',           budget:'৳25,000 – ৳80,000', activity:'Mount Batur sunrise trek & rice terraces', highlights:['Tegalalang rice terraces','Tanah Lot sunset','Ubud monkey forest'] },
      'Turkey':     { country:'Turkey',     weather:'Mild & perfect for sightseeing',        budget:'৳40,000 – ৳1,20,000', activity:'Hot air balloon ride over Cappadocia', highlights:['Cappadocia balloon ride','Hagia Sophia Istanbul','Pamukkale hot springs'] },
      'Malaysia':   { country:'Malaysia',   weather:'Warm with lower rainfall',              budget:'৳25,000 – ৳70,000', activity:'Petronas Towers & Penang street food tour', highlights:['Petronas Twin Towers','Penang food paradise','Langkawi island cable car'] },
    };

    const suggested = (monthDestMap[selectedMonth] || ["Cox's Bazar", 'Sylhet', 'Bandarban', 'Khulna']);

    const activityLabels = selectedActivities.map(id => activities.find(a => a.id === id)?.label);

    const recommendations = suggested.map((dest, i) => {
      const d = destDetails[dest] || { country:'Bangladesh', weather:'Pleasant', budget:'৳5,000 – ৳20,000', activity:'Explore & discover', highlights:['Local culture','Natural beauty','Cuisine'] };
      return {
        destination:     dest,
        country:         d.country,
        matchScore:      98 - i * 6,
        whyNow:          `${selectedMonth} offers ${d.weather.toLowerCase()} — ideal conditions to explore ${dest}.`,
        highlights:      d.highlights,
        bestFor:         `${travelStyle} travelers`,
        estimatedBudget: d.budget,
        weather:         d.weather,
        topActivity:     d.activity,
      };
    });

    setResults({
      summary: `${selectedMonth} is a wonderful time to travel for ${travelStyle.toLowerCase()} enthusiasts interested in ${activityLabels.slice(0,2).join(' and ')}. Here are your top picks curated for your preferences.`,
      recommendations,
      seasonalTip: `In ${selectedMonth}, book accommodation at least 2–3 weeks in advance for popular destinations and always carry light layers for evening temperature changes.`,
    });

    setLoading(false);
  };

  const handlePlanTrip = (destination) => {
    // Parse budget range
    const [bMin, bMax] = budget
      ? budget.replace('+','').split('-').map(Number)
      : [0, 50000];

    router.push(
      `/customize-trip?destination=${encodeURIComponent(destination)}&duration=3&travelType=solo&budgetMin=${bMin || 0}&budgetMax=${bMax || 50000}`
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'Montserrat, sans-serif', paddingBottom: '80px' }}>
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:0.5} }
        .act-card:hover    { border-color: #0d1b2a !important; background: #f8fafc !important; }
        .act-card          { transition: all 0.15s ease !important; }
        .result-card:hover { box-shadow: 0 8px 28px rgba(0,0,0,0.10) !important; transform: translateY(-2px); }
        .result-card       { transition: all 0.22s ease !important; }
        .plan-btn:hover    { background: #1a3a5c !important; }
        select:focus       { outline: 2px solid #0d1b2a !important; outline-offset: 1px; }
      `}</style>

      {/* ── Header ── */}
      <div style={{ background: 'linear-gradient(135deg, #0d1b2a 0%, #1a3a5c 100%)', padding: '2rem 2.5rem', color: 'white' }}>
        <button
          onClick={() => router.push('/Dashboard')}
          style={{ background:'none', border:'none', color:'rgba(255,255,255,0.65)', cursor:'pointer', fontSize:'0.72rem', fontWeight:700, letterSpacing:'0.08em', display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'1.25rem', fontFamily:'Montserrat, sans-serif' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          BACK TO DASHBOARD
        </button>
        <h1 style={{ fontSize:'clamp(1.8rem,4vw,2.8rem)', fontWeight:900, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'0.4rem' }}>
          Season Guide
        </h1>
        <p style={{ fontSize:'0.85rem', opacity:0.7 }}>
          Tell us your preferences — we'll find the perfect destination for your travel month
        </p>
      </div>

      <div style={{ maxWidth:'900px', margin:'0 auto', padding:'2.5rem 1.5rem' }}>

        {/* ── Form Card ── */}
        <div style={{ background:'white', border:'1px solid #eee', padding:'2rem', marginBottom:'2rem' }}>
          <h2 style={{ fontSize:'0.72rem', fontWeight:900, letterSpacing:'0.14em', textTransform:'uppercase', color:'#0d1b2a', marginBottom:'1.75rem', paddingBottom:'0.5rem', borderBottom:'2px solid #0d1b2a' }}>
            Your Travel Preferences
          </h2>

          {/* Row 1: Month + Style */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.25rem', marginBottom:'1.5rem' }}>
            <div>
              <label style={labelStyle}>When do you want to travel? <span style={{ color:'#e53e3e' }}>*</span></label>
              <div style={{ position:'relative' }}>
                <span style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', fontSize:'14px', pointerEvents:'none' }}>📅</span>
                <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} style={{ ...selectStyle, paddingLeft:'38px' }}>
                  <option value="">Select a month</option>
                  {months.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Travel Style <span style={{ color:'#e53e3e' }}>*</span></label>
              <select value={travelStyle} onChange={e => setTravelStyle(e.target.value)} style={selectStyle}>
                <option value="">Select your travel style</option>
                {travelStyles.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Activities */}
          <div style={{ marginBottom:'1.5rem' }}>
            <label style={{ ...labelStyle, display:'block', marginBottom:'0.75rem' }}>
              What activities interest you? <span style={{ color:'#e53e3e' }}>*</span>
              <span style={{ fontWeight:400, color:'#888', marginLeft:'0.4rem' }}>(select at least one)</span>
            </label>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'0.6rem' }}>
              {activities.map(act => {
                const checked = selectedActivities.includes(act.id);
                return (
                  <div
                    key={act.id}
                    className="act-card"
                    onClick={() => toggleActivity(act.id)}
                    style={{ display:'flex', alignItems:'center', gap:'0.65rem', padding:'0.75rem 1rem', border: checked ? '2px solid #0d1b2a' : '1px solid #e5e5e5', background: checked ? '#f0f4f8' : 'white', cursor:'pointer' }}
                  >
                    <span style={{ fontSize:'1.1rem' }}>{act.emoji}</span>
                    <span style={{ fontSize:'0.78rem', fontWeight: checked ? 700 : 500, color: checked ? '#0d1b2a' : '#555' }}>{act.label}</span>
                    {checked && (
                      <div style={{ marginLeft:'auto', width:'16px', height:'16px', background:'#0d1b2a', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Budget */}
          <div style={{ marginBottom:'1.5rem' }}>
            <label style={{ ...labelStyle, display:'block', marginBottom:'0.5rem' }}>Budget Range (BDT)</label>
            <select value={budget} onChange={e => setBudget(e.target.value)} style={selectStyle}>
              {budgetRanges.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
            </select>
          </div>

          {error && (
            <div style={{ background:'#fff0f0', border:'1px solid #ffcccc', color:'#cc0000', fontSize:'0.78rem', padding:'0.65rem 1rem', marginBottom:'1rem' }}>
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{ width:'100%', padding:'1rem', background: loading ? '#555' : '#0d1b2a', color:'white', border:'none', cursor: loading ? 'not-allowed' : 'pointer', fontSize:'0.72rem', fontWeight:800, letterSpacing:'0.15em', textTransform:'uppercase', fontFamily:'Montserrat, sans-serif', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.6rem', transition:'background 0.2s' }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background='#1a3a5c'; }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.background=loading?'#555':'#0d1b2a'; }}
          >
            {loading ? (
              <>
                <div style={{ width:'14px', height:'14px', border:'2px solid rgba(255,255,255,0.3)', borderTop:'2px solid white', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
                Finding your perfect destinations...
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                Get Destination Recommendations
              </>
            )}
          </button>
        </div>

        {/* ── Results ── */}
        {results && (
          <div style={{ animation:'fadeUp 0.4s ease' }}>

            {/* Summary banner */}
            <div style={{ background:'#0d1b2a', color:'white', padding:'1.25rem 1.5rem', marginBottom:'1.5rem', display:'flex', gap:'1rem', alignItems:'flex-start' }}>
              <span style={{ fontSize:'1.5rem', flexShrink:0 }}>✨</span>
              <div>
                <p style={{ fontSize:'0.62rem', fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', opacity:0.55, marginBottom:'0.3rem' }}>
                  Your {selectedMonth} Recommendations
                </p>
                <p style={{ fontSize:'0.88rem', lineHeight:1.7, opacity:0.9 }}>{results.summary}</p>
              </div>
            </div>

            {/* Cards */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.25rem', marginBottom:'1.5rem' }}>
              {results.recommendations.map((rec, i) => (
                <div
                  key={i}
                  className="result-card"
                  style={{ background:'white', border:'1px solid #eee', overflow:'hidden', animation:`fadeUp 0.4s ease ${i*0.08}s both` }}
                >
                  {/* Card header */}
                  <div style={{ background:'linear-gradient(135deg, #0d1b2a, #1a3a5c)', padding:'1.25rem 1.5rem', color:'white', display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                    <div>
                      <p style={{ fontSize:'0.62rem', opacity:0.55, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:'0.2rem' }}>{rec.country}</p>
                      <h3 style={{ fontSize:'1.1rem', fontWeight:800 }}>{rec.destination}</h3>
                      <p style={{ fontSize:'0.72rem', opacity:0.7, marginTop:'0.2rem' }}>{rec.bestFor}</p>
                    </div>
                    <div style={{ textAlign:'right', flexShrink:0 }}>
                      <div style={{ fontSize:'1.4rem', fontWeight:900, lineHeight:1 }}>{rec.matchScore}</div>
                      <div style={{ fontSize:'0.58rem', opacity:0.6, letterSpacing:'0.08em', textTransform:'uppercase' }}>% match</div>
                    </div>
                  </div>

                  {/* Card body */}
                  <div style={{ padding:'1.25rem 1.5rem' }}>

                    {/* Why now */}
                    <div style={{ background:'#f0f9f4', border:'1px solid #d1fae5', padding:'0.65rem 0.85rem', marginBottom:'1rem', display:'flex', gap:'0.5rem', alignItems:'flex-start' }}>
                      <span style={{ fontSize:'0.9rem', flexShrink:0 }}>📅</span>
                      <p style={{ fontSize:'0.78rem', color:'#166534', lineHeight:1.55 }}>{rec.whyNow}</p>
                    </div>

                    {/* Highlights */}
                    <div style={{ marginBottom:'1rem' }}>
                      <p style={{ fontSize:'0.6rem', fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase', color:'#888', marginBottom:'0.5rem' }}>Highlights</p>
                      <div style={{ display:'flex', flexDirection:'column', gap:'0.3rem' }}>
                        {rec.highlights.map((h, j) => (
                          <div key={j} style={{ display:'flex', gap:'0.5rem', alignItems:'center' }}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/></svg>
                            <span style={{ fontSize:'0.78rem', color:'#444' }}>{h}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Stats row */}
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem', marginBottom:'1rem' }}>
                      <div style={{ background:'#f9fafb', padding:'0.65rem 0.75rem' }}>
                        <p style={{ fontSize:'0.58rem', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'#888', marginBottom:'0.2rem' }}>Weather</p>
                        <p style={{ fontSize:'0.75rem', color:'#333', fontWeight:600 }}>{rec.weather}</p>
                      </div>
                      <div style={{ background:'#f9fafb', padding:'0.65rem 0.75rem' }}>
                        <p style={{ fontSize:'0.58rem', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'#888', marginBottom:'0.2rem' }}>Est. Budget</p>
                        <p style={{ fontSize:'0.75rem', color:'#0d1b2a', fontWeight:700 }}>{rec.estimatedBudget}</p>
                      </div>
                    </div>

                    {/* Top activity */}
                    <div style={{ background:'#f0f4f8', padding:'0.65rem 0.85rem', marginBottom:'1rem', fontSize:'0.78rem', color:'#0d1b2a' }}>
                      <strong>Top pick:</strong> {rec.topActivity}
                    </div>

                    <button
                      className="plan-btn"
                      onClick={() => handlePlanTrip(rec.destination)}
                      style={{ width:'100%', padding:'0.75rem', background:'#0d1b2a', color:'white', border:'none', cursor:'pointer', fontSize:'0.68rem', fontWeight:800, letterSpacing:'0.12em', textTransform:'uppercase', fontFamily:'Montserrat, sans-serif', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem', transition:'background 0.2s' }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                      Plan This Trip
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Seasonal tip */}
            <div style={{ background:'white', border:'1px solid #eee', padding:'1.25rem 1.5rem', display:'flex', gap:'1rem', alignItems:'flex-start' }}>
              <span style={{ fontSize:'1.2rem', flexShrink:0 }}>💡</span>
              <div>
                <p style={{ fontSize:'0.62rem', fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase', color:'#0d1b2a', marginBottom:'0.3rem' }}>Seasonal Travel Tip</p>
                <p style={{ fontSize:'0.82rem', color:'#555', lineHeight:1.7 }}>{results.seasonalTip}</p>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

const labelStyle = {
  display:       'block',
  fontSize:      '0.62rem',
  fontWeight:    700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color:         '#666',
  marginBottom:  '0.4rem',
};

const selectStyle = {
  width:           '100%',
  padding:         '0.65rem 0.75rem',
  border:          '1px solid #ddd',
  fontSize:        '0.85rem',
  fontFamily:      'Montserrat, sans-serif',
  color:           '#333',
  background:      'white',
  appearance:      'none',
  outline:         'none',
  cursor:          'pointer',
  boxSizing:       'border-box',
};