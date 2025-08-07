import React from 'react'
import './Footer.css'
import { FaFacebookF, FaYoutube, FaWhatsapp, FaInstagram } from 'react-icons/fa'


const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          {/* Footer Left - Logo/Brand */}
          <div className="footer-left">
            <div className="footer-logo">
              <h2 className="footer-brand">Truowners</h2>
              <p className="footer-tagline">Find your perfect rental home</p>
            </div>
          </div>

          {/* Footer Center - Useful Links */}
          <div className="footer-center">
            <h3 className="footer-title">Useful Links</h3>
            <ul className="footer-links">
              <li><a href="/about">About Us</a></li>
              <li><a href="/termcondition">Terms and Conditions</a></li>
              <li><a href="/privacy">Privacy Policy</a></li>
              <li><a href="/faq">FAQ</a></li>
              <li><a href="/contact">Contact</a></li>
            </ul>
          </div>

          {/* Footer Right - Contact */}
          <div className="footer-right">
            <h3 className="footer-title">Contact</h3>
            <div className="footer-contact">
              <div className="footer-contact-item">
                <span className="contact-icon">📞</span>
                <p>+1 (555) 123-4567</p>
              </div>
              <div className="footer-contact-item">
                <span className="contact-icon">✉️</span>
                <p>support@truowners.com</p>
              </div>
              <div className="footer-contact-item">
                <span className="contact-icon">📍</span>
                <p>123 Property Street, City, State 12345</p>
              </div>
            </div>

            {/* Social Media Links */}
            {/* <div className="footer-social">
              <h4>Follow Us</h4>
              <div className="social-links">
                <a href="#" className="social-link">📘</a>
                <a href="#" className="social-link">📷</a>
                <a href="#" className="social-link">🐦</a>
                <a href="#" className="social-link">💼</a>
              </div>
            </div> */}
            <div className="footer-social">
              <h4>Follow Us</h4>
              <div className="social-links">
                <a href="https://facebook.com" className="social-link" target="_blank" rel="noopener noreferrer">
                  <FaFacebookF />
                </a>
                <a href="https://youtube.com" className="social-link" target="_blank" rel="noopener noreferrer">
                  <FaYoutube />
                </a>
                <a href="https://wa.me/your-number" className="social-link" target="_blank" rel="noopener noreferrer">
                  <FaWhatsapp />
                </a>
                <a href="https://instagram.com" className="social-link" target="_blank" rel="noopener noreferrer">
                  <FaInstagram />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p>&copy; 2024 Truowners. All rights reserved.</p>
            <div className="footer-bottom-links">
              <p>Developed by <a href="https://www.italliance.tech" style={{ color: '#fff' }} >IT Alliance</a> </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
