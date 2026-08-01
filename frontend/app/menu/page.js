import Link from "next/link";
import Menu from "../components/Menu";
import "../page.css"; // Reuse homepage nav styles
import "./page.css";

export default function MenuPage() {
  return (
    <main className="main">
      {/* Solid Header for internal pages */}
      <header className="header menu-page-header">
        <div className="container header-container">
          <Link href="/" className="logo">
            Al-Nawab
          </Link>
          <nav className="nav">
            <Link href="/menu" className="nav-link" style={{ color: "var(--color-gold)" }}>Menu</Link>
            <Link href="/#feast" className="nav-link">The Royal Feast</Link>
            <Link href="/#reservations" className="nav-link">Reservations</Link>
            <Link href="/#contact" className="nav-link">Contact</Link>
          </nav>
          <div className="header-actions">
            <button className="btn-primary">Order Online</button>
          </div>
        </div>
      </header>

      <section className="menu-page-main">
        <div className="container">
          <h1 className="menu-page-title">The Royal Menu</h1>
          <p className="menu-page-subtitle">A culinary journey through the royal kitchens of Awadh.</p>
          <Menu />
        </div>
      </section>
    </main>
  );
}
