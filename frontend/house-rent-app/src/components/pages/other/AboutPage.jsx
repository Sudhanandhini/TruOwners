import React from "react";
import "./AboutPage.css";
import aboutImage from "/src/assets/images/homebanner.jpg"; // Replace with your image
import infoImage from "/src/assets/images/homebanner.jpg"; // Replace with another image
import { FaCheckSquare } from "react-icons/fa";

const AboutPage = () => {
  return (
    <div className="about-page">
      {/* 1. Hero Section */}
      <section className="about-hero">
        <h1>About TruOwner</h1>
        <p>Your trusted rental partner for hassle-free property experiences.</p>
      </section>

      {/* 2. Side-by-Side Image and Paragraph Section */}
      <section className="about-content">
        <div className="image-container">
          <img src={aboutImage} alt="About TruOwner" />
        </div>
        <div className="text-container">
          <h2 className="head2">Who We Are</h2>
          <p>
            At TruOwner, we make renting a home in Bangalore simple and stress-free. With 12+ years of experience, founder Mr. Ganesh and his team have helped over 2500 families find homes that fit their budget and lifestyle. Built to remove rental hassles like high brokerage, limited choices, and unclear terms, TruOwner offers verified, affordable rental and lease options. Whether you're a student, professional, or family, we provide trusted listings, digital convenience, and personalized service — so you don’t just find a house, you feel at home.

          </p>
        </div>
      </section>

       {/* 4. CTA or Testimonials (optional) */}
      <section className="about-cta">
        <h2 className="head2">Ready to Rent Smarter?</h2>
        <p>Join thousands of users who trust TruOwner for a better rental journey.</p>
        <button>Get Started</button>
      </section>



      {/* 3. Features/Values Section (like image you uploaded) */}
      <section className="about-values">
        <div className="text-list">
          <ul>
            <li>
              <FaCheckSquare className="icon" />
              <strong className="left-side">Trust & Transparency:</strong> TruOwner eliminates common rental hassles like high brokerage.
            </li>
            <li>
              <FaCheckSquare className="icon" />
              <strong className="left-side">Experienced & Reliable:</strong> Backed by 12+ years of real estate expertise through.
            </li>
            <li>
              <FaCheckSquare className="icon" />
              <strong className="left-side">Tailored, Verified Rentals:</strong> Homes curated to your needs — location, budget, size, and amenities — with every listing personally verified.
            </li>
            <li>
              <FaCheckSquare className="icon" />
              <strong className="left-side">Seamless Digital Process:</strong> Enjoy hassle-free renting with digital paperwork and dedicated, end-to-end support.
            </li>
            <li>
              <FaCheckSquare className="icon" />
              <strong className="left-side">Customer-First & Eco-Friendly:</strong> We prioritize your comfort and promote sustainability.
            </li>
          </ul>
        </div>
        <div className="image-container">
          <img src={infoImage} alt="Our Values" />
        </div>
      </section>

             {/* 3. Why Brokerage Broken Section */}
      <section className="why-broken">
        <h2 className="head2">
          WHAT MAKES US  <span className="broken">DIFFERENT</span>
        </h2>
        <div className="reasons">
          <div className="reason-card">
            <div className="emoji">📅</div>
            <h4 className="head2">Home that suit you</h4>
            <p>Find homes that match your lifestyle and needs, offering a personalized living experience designed .</p>
          </div>
          <div className="reason-card">
            <div className="emoji">🏷️</div>
            <h4 className="head2">Comfort essentials</h4>
            <p>Enjoy beautifully designed homes with essential amenities, smart layouts, and features that make daily living easy, relaxing, and comfortable.</p>
          </div>
          <div className="reason-card">
            <div className="emoji">💰</div>
            <h4 className="head2">Better Price</h4>
            <p>Get high-quality homes at competiti. without compromising on design, comfort, or construction standards.</p>
          </div>
          <div className="reason-card">
            <div className="emoji">📜</div>
            <h4 className="head2">Agreement</h4>
            <p>Experience a smooth, transparent agreement process with complete legal support, ensuring clarity, trust, and peace of mind at every step.</p>
          </div>
        </div>
      </section>

     
    </div>
  );
};

export default AboutPage;
