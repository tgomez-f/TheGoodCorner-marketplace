import React from 'react';
import { Link } from 'react-router-dom';
import { Trans } from '@lingui/react/macro';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Column 1 */}
          <div className="footer-column">
            <h3 className="footer-title">TheGoodCorner</h3>
            <p className="footer-text">
              <Trans>Votre boutique en ligne pour les meilleurs produits handpickés.</Trans>
            </p>
          </div>

          {/* Column 2 */}
          <div className="footer-column">
            <h3 className="footer-title">
              <Trans>Navigation</Trans>
            </h3>
            <ul className="footer-links">
              <li>
                <Link to="/">
                  <Trans>Accueil</Trans>
                </Link>
              </li>
              <li>
                <Link to="/products">
                  <Trans>Produits</Trans>
                </Link>
              </li>
              <li>
                <Link to="/authentication">
                  <Trans>Connexion / Inscription</Trans>
                </Link>
              </li>
              <li>
                <Link to="/messagerie">
                  <Trans>Mes Discussions</Trans>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3 */}
          <div className="footer-column">
            <h3 className="footer-title">
              <Trans>Support</Trans>
            </h3>
            <ul className="footer-links">
              <li>
                <Link to="/faq">
                  <Trans>FAQ</Trans>
                </Link>
              </li>
              <li>
                <Link to="/conditions-generales">
                  <Trans>Conditions générales</Trans>
                </Link>
              </li>
              <li>
                <Link to="/confidentialite">
                  <Trans>Politique de confidentialité</Trans>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4 */}
          <div className="footer-column">
            <h3 className="footer-title">
              <Trans>Nous suivre</Trans>
            </h3>
            <ul className="footer-links">
              <li><Facebook size={14}/><a href="#facebook">Facebook</a></li>
              <li><Twitter size={14}/><a href="#twitter">Twitter</a></li>
              <li><Instagram size={14}/><a href="#instagram">Instagram</a></li>
              <li><Linkedin size={14}/><a href="#linkedin">Linkedin</a></li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="footer-divider"></div>
        <div className="footer-bottom">
          <p>
            <Trans>&copy; 2026 TheGoodCorner. Tous droits réservés.</Trans>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;