"use client";
import { useState } from "react";
import "./ReservationForm.css";

export default function ReservationForm() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    date: "",
    time: "",
    guests: "2",
    occasion: ""
  });
  
  const [status, setStatus] = useState("idle"); // idle, submitting, success, error
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("submitting");
    
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setStatus("success");
        setMessage(data.message);
        setFormData({
          name: "",
          phone: "",
          date: "",
          time: "",
          guests: "2",
          occasion: ""
        });
      } else {
        setStatus("error");
        setMessage(data.message);
      }
    } catch (error) {
      setStatus("error");
      setMessage("An unexpected error occurred. Please try calling us directly.");
    }
  };

  return (
    <div className="reservation-container">
      <form className="reservation-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input type="text" id="name" name="name" required value={formData.name} onChange={handleChange} />
          </div>
          
          <div className="form-group">
            <label htmlFor="phone">Phone Number *</label>
            <input type="tel" id="phone" name="phone" required value={formData.phone} onChange={handleChange} />
          </div>
          
          <div className="form-group">
            <label htmlFor="date">Date *</label>
            <input type="date" id="date" name="date" required value={formData.date} onChange={handleChange} />
          </div>
          
          <div className="form-group">
            <label htmlFor="time">Time *</label>
            <input type="time" id="time" name="time" required value={formData.time} onChange={handleChange} />
          </div>
          
          <div className="form-group">
            <label htmlFor="guests">Number of Guests *</label>
            <select id="guests" name="guests" value={formData.guests} onChange={handleChange}>
              {[1,2,3,4,5,6,7,8,9,10].map(n => (
                <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>
              ))}
              <option value="10+">10+ Guests (Call us)</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="occasion">Special Occasion (Optional)</label>
            <select id="occasion" name="occasion" value={formData.occasion} onChange={handleChange}>
              <option value="">None</option>
              <option value="Birthday">Birthday</option>
              <option value="Anniversary">Anniversary</option>
              <option value="Family Gathering">Family Gathering</option>
              <option value="Business Dinner">Business Dinner</option>
            </select>
          </div>
        </div>
        
        <button type="submit" className="btn-primary form-submit-btn" disabled={status === "submitting"}>
          {status === "submitting" ? "Confirming..." : "Book Table"}
        </button>
        
        {status === "success" && <p className="form-message success">{message}</p>}
        {status === "error" && <p className="form-message error">{message}</p>}
      </form>
    </div>
  );
}
