// Entete.jsx
import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
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
          <NavLink to="/" className={({ isActive }) => isActive ? "active" : ""}>Accueil</NavLink>
          <NavLink to="/abonnements" className={({ isActive }) => isActive ? "active" : ""}>Abonnements</NavLink>
          <NavLink to="/coursGroupe" className={({ isActive }) => isActive ? "active" : ""}>Cours en groupe</NavLink>
          <a href="#aPropos">À propos</a>
          <a href="#horaire">Horaires</a>
        </nav>

        {/* Login + Burger mobile */}
        <div className="entete-droite">
          <img src={Login} alt="Login" className="login-icon" />
          <button className="burger" onClick={() => setIsOpen(true)}>☰</button>
        </div>
      </header>

      {/* Menu burger mobile */}
      <div className={`menu ${isOpen ? "open" : ""}`}>
        <button className="close" onClick={() => setIsOpen(false)}>✕</button>

        <div className="menu-logo">
          <Link to="/"><img src={LogoWebFit} alt="WebFit" /></Link>
        </div>

        <nav>
          <NavLink to="/" onClick={() => setIsOpen(false)} className={({ isActive }) => isActive ? "active" : ""}>Accueil</NavLink>
          <NavLink to="/abonnements" onClick={() => setIsOpen(false)} className={({ isActive }) => isActive ? "active" : ""}>Abonnements</NavLink>
          <NavLink to="/coursGroupe" onClick={() => setIsOpen(false)} className={({ isActive }) => isActive ? "active" : ""}>Cours en groupe</NavLink>
          <a href="#aPropos" onClick={() => setIsOpen(false)}>À propos</a>
          <a href="#horaire" onClick={() => setIsOpen(false)}>Horaires</a>
        </nav>
      </div>
    </>
  );
}
