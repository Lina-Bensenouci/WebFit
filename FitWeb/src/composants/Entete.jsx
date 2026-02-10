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
        <div className="entete-logo">
            <Link to="/"><img src={LogoWebFit} alt="WebFit" /></Link>
        </div>

        {/* Burger + Login collés */}
        <div className="entete-droite">
          <img src={Login} alt="Login" className="login-icon" />
          <button className="burger" onClick={() => setIsOpen(true)}>☰</button>
        </div>
      </header>

      {/* Menu burger */}
      <div className={`menu ${isOpen ? "open" : ""}`}>
        <button className="close" onClick={() => setIsOpen(false)}>✕</button>
        <nav>
          {/* Nouvelle page */}
          <Link to="/" onClick={() => setIsOpen(false)}>Accueil</Link>

          {/* Section */}
          <a href="#about" onClick={() => setIsOpen(false)}>À propos</a>

          {/* Nouvelle page */}
          <Link to="/abonnements" onClick={() => setIsOpen(false)}>Abonnements</Link>

          {/* Section */}
          <a href="#hours" onClick={() => setIsOpen(false)}>Horaires</a>

          {/* Nouvelle page */}
          <Link to="/cours" onClick={() => setIsOpen(false)}>Cours en groupe</Link>
          
        </nav>
      </div>
    </>
  );
}
