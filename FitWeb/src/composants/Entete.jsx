import { useState } from "react";
import { Link } from "react-router-dom";
import "./Entete.scss";
import LogoWebFit from "../Images/Logo4WebFit.png";
import Login from "../Images/Login2.png";

export default function Entete() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Header */}
      <header className="entete">
        {/* Logo cliquable vers accueil */}
        <div className="entete-logo">
          <Link to="/"><img src={LogoWebFit} alt="WebFit" /></Link>
        </div>

        {/* Nav desktop */}
        <nav className="menu-desktop-nav">
          {/* Nouvelle page */}
          <Link to="/">Accueil</Link>

          {/* Nouvelle page */}
          <Link to="/abonnements">Abonnements</Link>

          {/* Nouvelle page */}
          <Link to="/cours">Cours en groupe</Link>

          {/* Section */}
          <a href="#about">À propos</a>

          {/* Section */}
          <a href="#hours">Horaires</a>
        </nav>

        {/* Login + Burger mobile */}
        <div className="entete-droite">
          {/* Login */}
          <img src={Login} alt="Login" className="login-icon" />

          {/* Burger mobile */}
          <button className="burger" onClick={() => setIsOpen(true)}>☰</button>
        </div>
      </header>

      {/* Menu burger mobile */}
      <div className={`menu ${isOpen ? "open" : ""}`}>
        {/* Bouton fermer */}
        <button className="close" onClick={() => setIsOpen(false)}>✕</button>

        {/* Logo dans le menu */}
        <div className="menu-logo">
          <Link to="/"><img src={LogoWebFit} alt="WebFit" /></Link>
        </div>

        {/* Liens menu mobile */}
        <nav>
          {/* Nouvelle page */}
          <Link to="/" onClick={() => setIsOpen(false)}>Accueil</Link>

          {/* Nouvelle page */}
          <Link to="/abonnements" onClick={() => setIsOpen(false)}>Abonnements</Link>

          {/* Nouvelle page */}
          <Link to="/cours" onClick={() => setIsOpen(false)}>Cours en groupe</Link>
          
          {/* Section */}
          <a href="#about" onClick={() => setIsOpen(false)}>À propos</a>

          {/* Section */}
          <a href="#hours" onClick={() => setIsOpen(false)}>Horaires</a>

          
        </nav>
      </div>
    </>
  );
}
