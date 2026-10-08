import Image from "next/image";
import Link from "next/link";
import Navbar from "./components/Navbar";
import ReservationForm from "./components/ReservationForm";
import FeastGallery from "./components/FeastGallery";
import SocialProof from "./components/SocialProof";
import ContactSection from "./components/ContactSection";
import "./page.css";

export default function Home() {
  return (
    <main className="main">
      {/* Dynamic Full-Stack Navbar */}
      <Navbar activePage="home" />

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg">
          <Image 
            src="/images/201.jpg" 
            alt="Al-Nawab Restaurant Storefront" 
            fill
            className="hero-image"
            priority
          />
        </div>
      </section>

      {/* Royal Feast Gallery */}
      <section id="feast" className="section feast-section">
        <div className="container">
          <h2 className="section-title">The Royal feast</h2>
          <FeastGallery />
        </div>
      </section>

      {/* Social Proof Section */}
      <section id="social-proof" className="section social-proof-section">
        <div className="container">
          <SocialProof />
        </div>
      </section>

      {/* Reservations Section */}
      <section id="reservations" className="section reservation-section">
        <div className="container">
          <h2 className="section-title">Book a Table</h2>
          <p className="section-subtitle">Reserve your royal dining experience</p>
          <ReservationForm />
        </div>
      </section>

      <ContactSection />
    </main>
  );
}
