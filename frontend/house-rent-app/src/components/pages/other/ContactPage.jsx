import React from "react";
import "./ContactPage.css";
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from "react-icons/fa";
import { FaClock } from 'react-icons/fa';

const ContactPage = () => {
  return (
    <div className="contact-page">
      {/* 1. Hero Section */}
      <section className="hero-contact">
        <h1>Contact Us</h1>
        <p>We’d love to hear from you. Let’s talk!</p>
      </section>

      {/* 2. Contact Form + Info */}
      <section className="contact-main">
         <div className="contact-info">
          <h1 className="head1">Get In Touch</h1>
          <ul>
            <li>
              <FaMapMarkerAlt className="icon" />
              <div>
                <h4>Address</h4>
                <p>123 Main Street, Your City, Country</p>
              </div>
            </li>
            <li>
              <FaPhoneAlt className="icon" />
              <div>
                <h4>Phone</h4>
                <p>+1 (234) 567-8900</p>
              </div>
            </li>
            <li>
              <FaEnvelope className="icon" />
              <div>
                <h4>Email</h4>
                <p>contact@yourdomain.com</p>
              </div>
            </li>
             <li>
              <FaClock className="icon" />
              <div>
                <h4>Working Hours</h4>
                <p>Mon - Sat</p>
              </div>
            </li>
          </ul>
        </div>
        <div className="contact-form">
          <h1  className="head1">Contact Us</h1>
          <form>
            <input type="text" placeholder="Full Name" required />
             <input type="number" placeholder="Phone Number" required />
            <input type="email" placeholder="Email Address" required />
            <textarea placeholder="Your Message" rows="2" required></textarea>
            <button type="submit">Send Message</button>
          </form>
        </div>

      </section>

    
    </div>
  );
};

export default ContactPage;
