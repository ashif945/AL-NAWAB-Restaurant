import Image from "next/image";
import "./FeastGallery.css";

const GALLERY_IMAGES = [
  {
    id: 1,
    src: "/images/5.jpeg",
    alt: "Al-Nawab Restaurant Exterior",
    label: "Arrival",
    caption: "A warm evening entrance framed with soft lights and greenery.",
    height: 520,
  },
  {
    id: 2,
    src: "/images/1.jpeg",
    alt: "Al-Nawab Reception Area",
    label: "Welcome",
    caption: "A calm reception corner with patterned screens and amber glow.",
    height: 500,
  },
  {
    id: 3,
    src: "/images/9.jpeg",
    alt: "Main Dining Hall",
    label: "Dining Room",
    caption: "Pastel walls, plush seating, and an intimate dining layout.",
    height: 340,
  },
  {
    id: 4,
    src: "/images/10.jpeg",
    alt: "Royal Floor Seating",
    label: "Gathering Nook",
    caption: "Floor seating designed for private moments and shared meals.",
    height: 340,
  },
  {
    id: 5,
    src: "/images/14.jpeg",
    alt: "Celebration Corner",
    label: "Celebration",
    caption: "A festive nook that completes the floor-seating experience.",
    height: 320,
  },
];

export default function FeastGallery() {
  return (
    <div className="gallery-container">
      <div className="masonry-grid">
        {GALLERY_IMAGES.map((img) => (
          <div key={img.id} className="masonry-item" style={{ height: `${img.height}px` }}>
            <Image 
              src={img.src} 
              alt={img.alt} 
              fill
              className="masonry-image"
            />
            <div className="masonry-overlay">
              <p className="serves-badge">{img.label}</p>
              <h4>{img.alt}</h4>
              <p className="masonry-caption">{img.caption}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="feast-cta">
        <div>
          <span className="feast-eyebrow">Host With Al-Nawab</span>
          <p>Planning a gathering? Pair these inviting spaces with our signature family platters and celebratory spreads.</p>
        </div>
        <button className="btn-primary feast-cta-button">Pre-Order Feast</button>
      </div>
    </div>
  );
}
