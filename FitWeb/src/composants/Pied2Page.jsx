import "./Pied2Page.scss";
import LogoWebFit from "../Images/Logo4WebFit.png";
import InstaIcon from "../Images/instagram.png";
import TikTokIcon from "../Images/tiktok.png";

export default function Footer() {
  return (
    <footer className="footer">
      {/* Menu à gauche */}
      <div className="footer-menu-wrapper">
        <h4 className="footer-title">Explorer</h4>
        <nav className="footer-menu">
          <a href="#accueil">Accueil</a>
          <a href="#abonnements">Abonnements</a>
          <a href="#coursGroupe">Cours en groupe</a>
          <a href="#horaires">Horaire</a>
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
      <div className="footer-horaires">
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
            <tr><td>Lundi</td><td>6h</td><td>22h</td></tr>
            <tr><td>Mardi</td><td>6h</td><td>22h</td></tr>
            <tr><td>Mercredi</td><td>6h</td><td>22h</td></tr>
            <tr><td>Jeudi</td><td>6h</td><td>22h</td></tr>
            <tr><td>Vendredi</td><td>6h</td><td>22h</td></tr>
            <tr><td>Samedi</td><td>8h</td><td>20h</td></tr>
            <tr><td>Dimanche</td><td>Fermé</td><td>Fermé</td></tr>
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
