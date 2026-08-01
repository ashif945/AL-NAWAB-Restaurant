import Image from "next/image";
import { Star, Camera } from "lucide-react";
import "./SocialProof.css";

const REVIEWS = [
  { id: 1, name: "Rahul S.", text: "The best Biryani in Noida, hands down! The meat was tender and the flavors were absolutely royal.", rating: 5 },
  { id: 2, name: "Priya M.", text: "Booked a table for my parents' anniversary. The hospitality was exceptional, and the Galouti Kebabs melted in our mouths.", rating: 5 },
  { id: 3, name: "Vikram K.", text: "Authentic Awadhi taste. The family pack was massive and easily fed our group of 6. Highly recommend!", rating: 5 },
];

const ROYAL_DISHES = [
  {
    id: 1,
    src: "/images/17.jpeg",
    alt: "Mutton Curry Platter",
    label: "Royal Curry",
    caption: "Rich gravy served with folded rumali roti.",
  },
  {
    id: 2,
    src: "/images/19.jpeg",
    alt: "Creamy Chicken Curry",
    label: "Signature Dish",
    caption: "A silky white curry paired with fresh flatbread.",
  },
  {
    id: 3,
    src: "/images/16.jpeg",
    alt: "Hyderabadi Chicken Biryani",
    label: "Biryani",
    caption: "Long-grain rice layered with spice and tender chicken.",
  },
  {
    id: 4,
    src: "/images/13.jpeg",
    alt: "Grilled Chicken Platter",
    label: "Chargrill",
    caption: "Smoky grilled chicken with chutney and onion salad.",
  },
];

export default function SocialProof() {
  return (
    <div className="social-proof-container">
      <div className="reviews-section">
        <h3 className="sub-heading">What Our Guests Say</h3>
        <div className="reviews-grid">
          {REVIEWS.map((review) => (
            <div key={review.id} className="review-card">
              <div className="stars">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} size={16} fill="var(--color-gold)" color="var(--color-gold)" />
                ))}
              </div>
              <p className="review-text">"{review.text}"</p>
              <p className="review-author">- {review.name}</p>
            </div>
          ))}
        </div>
      </div>
      
      <div className="instagram-section">
        <h3 className="sub-heading">
          <Camera size={24} className="mr-2 inline" /> 
          Royal Dishes
        </h3>
        <p className="ig-handle">@AlNawabRestaurant</p>
        <div className="ig-grid">
          {ROYAL_DISHES.map((dish) => (
            <div key={dish.id} className="ig-placeholder ig-photo-card">
              <Image
                src={dish.src}
                alt={dish.alt}
                fill
                className="ig-photo"
                sizes="(max-width: 767px) 50vw, 25vw"
              />
              <div className="ig-overlay">
                <p className="ig-badge">{dish.label}</p>
                <h4>{dish.alt}</h4>
                <p className="ig-caption">{dish.caption}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
