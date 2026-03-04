import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import "./Pied2Page.scss";
import LogoWebFit from "../Images/Logo4WebFit.png";
import InstaIcon from "../Images/instagram.png";
import TikTokIcon from "../Images/tiktok.png";

export default function Footer() {
  const [horaires, setHoraires] = useState([]);
  useEffect(() => {
    // On récupère la base de l'URL (soit localhost, soit Render)
    const API_URL = import.meta.env.VITE_API_URL;

    // On combine la base avec la route spécifique
    fetch(`${API_URL}/horaires`)
      .then((res) => res.json())
      .then((data) => setHoraires(data))
      .catch((err) => console.error("Erreur chargement horaires:", err));
  }, []);
  
  return (
    <footer className="footer">
      {/* Menu */}
      <div className="footer-menu-wrapper">
        <h4 className="footer-title">Explorer</h4>
        <nav className="footer-menu">
          <NavLink to="/" className={({ isActive }) => isActive ? "active" : ""}>Accueil</NavLink>
          <NavLink to="/abonnements" className={({ isActive }) => isActive ? "active" : ""}>Abonnements</NavLink>
          <NavLink to="/coursGroupe" className={({ isActive }) => isActive ? "active" : ""}>Cours en groupe</NavLink>
          <a href="#aPropos">À propos</a>
          <a href="#horaire">Horaires</a>
        </nav>
      </div>

      {/* Icônes */}
      <div className="footer-socials">
        <a href="https://instagram.com" target="_blank" rel="noreferrer">
          <img src={InstaIcon} alt="Instagram" />
        </a>
        <a href="https://tiktok.com" target="_blank" rel="noreferrer">
          <img src={TikTokIcon} alt="TikTok" />
        </a>
      </div>

      {/* Tableau horaires */}
      <div id="horaire" className="footer-horaires">
        <h4 className="footer-title">Horaires</h4>
        <table>
          <thead>
            <tr>
              <th>Jour</th>
              <th>Ouverture</th>
              <th>Fermeture</th>
            </tr>
          </thead>
          <tbody>
            {horaires.map((h) => (
              <tr key={h.id}>
                <td>{h.jour}</td>
                <td>{h.ouverture}</td>
                <td>{h.fermeture}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Logo */}
      <div className="footer-logo">
        <img src={LogoWebFit} alt="Logo WebFit" />
      </div>
    </footer>
  );
}