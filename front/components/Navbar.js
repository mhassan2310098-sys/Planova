'use client';
import Link from 'next/link';
 
export default function Navbar() {
  return (
    <nav className="navbar">
      <Link href="/" className="navbar-logo">
        {/* Map icon SVG */}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
          <line x1="8" y1="2" x2="8" y2="18" />
          <line x1="16" y1="6" x2="16" y2="22" />
        </svg>
        PLANOVA
      </Link>
      <ul className="navbar-links">
        <li><a href="#about">About Us</a></li>
        <li><a href="#services">Services</a></li>
        <li><a href="#features">Features</a></li>
        <li><a href="#contact">Contact Us</a></li>
      </ul>
    </nav>
  );
}