import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLinkedin, faGithub } from '@fortawesome/free-brands-svg-icons';
import '../styles/Footer.css';

const Footer = () => {

  return (
    <footer id="footer" className="footer">
        <div className="footer-top">
            <a href="#home" className="chevron-link">
                <span className="chevron">&raquo;</span>
            </a>
        </div>
        <div className="footer-middle">
            <ul className="social-links">
            <li><a href="https://www.linkedin.com/in/r%C3%A9my-santoriello" target="_blank" rel="noreferrer" className="social-link"><FontAwesomeIcon icon={faLinkedin} /></a></li>
            <li><a href="https://github.com/Santoriellor/" target="_blank" rel="noreferrer" className="social-link"><FontAwesomeIcon icon={faGithub} /></a></li>
            </ul>
        </div>
        <div className="footer-bottom">
            <p>Rémy Santoriello <span>&copy;2025</span></p>
        </div>
    </footer>
  );
};

export default Footer;