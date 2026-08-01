"use client";

import {
  Headphones,
  MessageCircle,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import "./ContactSection.css";

const CONTACT_ITEMS = [
  {
    id: 1,
    icon: Headphones,
    label: "Costumer Service:",
    lines: ["08505969388"],
  },
  {
    id: 2,
    icon: MessageCircle,
    label: "WhatsApp:",
    lines: ["+966115001584"],
  },
  {
    id: 3,
    icon: Mail,
    label: "E-mail:",
    lines: ["alnawbnoida@gmail.com"],
  },
  {
    id: 4,
    icon: MapPin,
    label: "Address :",
    lines: ["Link Rd, Hazipur, Sector 104, Noida, Uttar Pradesh 201304"],
  },
];

const SOCIAL_LINKS = [
  {
    id: 1,
    icon: ({ size }) => (
      <span style={{ fontSize: size, lineHeight: 1, fontWeight: 800 }}>in</span>
    ),
    label: "LinkedIn",
  },
  {
    id: 2,
    icon: ({ size }) => (
      <span style={{ fontSize: size, lineHeight: 1, fontWeight: 700 }}>X</span>
    ),
    label: "X",
  },
  {
    id: 3,
    icon: ({ size }) => (
      <span style={{ fontSize: size - 1, lineHeight: 1, fontWeight: 800 }}>
        &#9654;
      </span>
    ),
    label: "YouTube",
  },
  {
    id: 4,
    icon: ({ size }) => (
      <span style={{ fontSize: size, lineHeight: 1, fontWeight: 800 }}>
        &#9835;
      </span>
    ),
    label: "TikTok",
  },
  { id: 5, icon: MapPin, label: "Location" },
  { id: 6, icon: Phone, label: "Phone" },
];

export default function ContactSection() {
  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <section id="contact" className="section contact-section">
      <div className="contact-shell">
        <div className="contact-overlay"></div>

        <div className="contact-content">
          <div className="contact-heading">
            <p className="contact-kicker">FOR INQUIRIES AND SERVICE REQUESTS</p>
            <h2>CONTACT US</h2>
          </div>

          <div className="contact-grid">
            <div className="contact-details">
              {CONTACT_ITEMS.map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.id} className="contact-item">
                    <div className="contact-icon-wrap">
                      <Icon size={30} strokeWidth={2.25} />
                    </div>

                    <div className="contact-copy">
                      <h3>{item.label}</h3>
                      {item.lines.map((line) => (
                        <p key={line}>{line}</p>
                      ))}
                    </div>
                  </div>
                );
              })}

              <div className="contact-socials">
                {SOCIAL_LINKS.map((item) => {
                  const Icon = item.icon;

                  return (
                    <a
                      key={item.id}
                      href="#"
                      aria-label={item.label}
                      className="contact-social-link"
                    >
                      <Icon size={22} />
                    </a>
                  );
                })}
              </div>
            </div>

            <form className="contact-form-panel" onSubmit={handleSubmit}>
              <input type="text" placeholder="Name*" aria-label="Name" />
              <input type="email" placeholder="E-mail*" aria-label="E-mail" />
              <input
                type="tel"
                placeholder="Phone number / WhatsApp Number*"
                aria-label="Phone number / WhatsApp Number"
              />
              <textarea
                placeholder="Inquiry Details*"
                rows={5}
                aria-label="Inquiry Details"
              ></textarea>
              <button type="submit" className="contact-submit">
                SEND
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
