import Link from 'next/link';
import Navbar from '../components/Navbar.js';
import Footer from '../components/Footer.js';

export default function HomePage() {
  return (
    <>
      <Navbar/>

      {/* ─── HERO ─── */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1 className="hero-title">PLANOVA</h1>
          <p className="hero-subtitle">SMART TRAVEL PLANNER SYSTEM</p>
        </div>
      </section>

      {/* ─── ABOUT / FEATURES ─── */}
      <section className="about-section" id="about">
        <h2 className="section-title">BEYOND THE JOURNEY</h2>
        <div className="section-divider" />
        <p className="section-desc">
          Planova revolutionizes travel planning by combining intelligent destination discovery, budget management,
          and automated itinerary generation into one seamless platform. Experience travel planning like never before.
        </p>

        <div className="features-grid" id="features">
          <div className="feature-card">
            <img
              src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=600"
              alt="Smart Route Planning"
            />
            <h3>Smart Route Planning</h3>
            <p>
              Our intelligent algorithms analyze thousands of routes and destinations to create the perfect travel
              plan tailored to your preferences and budget constraints.
            </p>
          </div>

          <div className="feature-card">
            <img
              src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600"
              alt="Local Dining & Culture"
            />
            <h3>Local Dining &amp; Culture</h3>
            <p>
              Discover authentic local restaurants, hidden culinary gems, and cultural experiences that make your
              journey unforgettable and truly immersive.
            </p>
          </div>

          <div className="feature-card">
            <img
              src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600"
              alt="Real-Time Updates"
            />
            <h3>Real-Time Updates</h3>
            <p>
              Stay informed with live updates on weather, local events, travel advisories, and personalized
              recommendations throughout your entire journey.
            </p>
          </div>
        </div>
      </section>

      {/* ─── SERVICES ─── */}
      <section className="services-section" id="services">
        <h2 className="section-title">WHEREVER THE ROAD LEADS</h2>
        <div className="section-divider" style={{ background: 'white' }} />

        <div className="services-grid">
          <div className="service-card">
            <img
              src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600"
              alt="Adventure Trips"
            />
            <div className="service-label">Adventure Trips</div>
          </div>

          <div className="service-card">
            <img
              src="https://images.unsplash.com/photo-1476842321362-f5bb3a58ab25?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Seasonal Getaways"
            />
            <div className="service-label">Seasonal Getaways</div>
          </div>

          <div className="service-card">
            <img
              src="https://images.unsplash.com/photo-1551632811-561732d1e306?w=600"
              alt="Group & Solo Trips"
            />
            <div className="service-label">Group &amp; Solo Trips</div>
          </div>

          <div className="service-card">
            <img
              src="https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600"
              alt="Luxury Stays"
            />
            <div className="service-label">Luxury Stays</div>
          </div>

          <div className="service-card">
            <img
              src="https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600"
              alt="Cultural Festivals"
            />
            <div className="service-label">Cultural Festivals</div>
          </div>

          <div className="service-card">
            <img
              src="https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=600"
              alt="Winter Retreats"
            />
            <div className="service-label">Winter Retreats</div>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="cta-section">
        <div className="cta-bg" />
        <div className="cta-overlay" />
        <div className="cta-content">
          <h2 className="cta-title">Ready to Plan Your Perfect Trip?</h2>
          <p className="cta-desc">
            Join thousands of travelers who trust Planova for smarter travel planning. Start your journey
            today and discover a better way to explore the world.
          </p>
          <Link href="/login" className="cta-btn">
            GET STARTED
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}