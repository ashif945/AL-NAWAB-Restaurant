import { Suspense } from "react";
import Navbar from "../components/Navbar";
import Menu from "../components/Menu";
import "../page.css"; // Reuse homepage nav styles
import "./page.css";

export default function MenuPage() {
  return (
    <main className="main">
      {/* Dynamic Full-Stack Navbar */}
      <Navbar activePage="menu" />

      <section className="menu-page-main">
        <div className="container">
          <h1 className="menu-page-title">The Royal Menu</h1>
          <p className="menu-page-subtitle">A culinary journey through the royal kitchens of Awadh.</p>
          <Suspense fallback={<div style={{ textAlign: "center", padding: "3rem" }}>Loading royal menu...</div>}>
            <Menu />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
