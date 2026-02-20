import React, { useState, useRef, useEffect } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { HashLink } from 'react-router-hash-link';

// SECTION : ASSETS ET COMPOSANTS
import "./Entete.scss";
import LogoWebFit from "../Images/Logo4WebFit.png";
import Login from "../Images/Login2.png";
import GoogleLogin from "./GoogleLogin.jsx";

export default function Entete() {
  // SECTION : ÉTATS (STATES)
  const [estOuvert, setEstOuvert] = useState(false);
  const [utilisateur, setUtilisateur] = useState(null);
  const [afficheDeconnexion, setAfficheDeconnexion] = useState(false);
  const [chargementEnCours, setChargementEnCours] = useState(false);

  // SECTION : RÉFÉRENCES ET ROUTAGE
  const googleLoginRef = useRef();
  const location = useLocation(); 

  // SECTION : EFFETS (USEEFFECT)
  useEffect(() => {
    const infosSauvegardees = localStorage.getItem("utilisateur_webfit");
    if (infosSauvegardees) {
      setUtilisateur(JSON.parse(infosSauvegardees));
    }
  }, []);

  // SECTION : LOGIQUE D'AUTHENTIFICATION
  const connexionBackend = async (donneesGoogle) => {
    try {
      const reponse = await fetch("http://localhost:8000/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: donneesGoogle.token }),
      });

      if (reponse.ok) {
        const utilisateurBaseDeDonnees = await reponse.json();
        setUtilisateur(utilisateurBaseDeDonnees);
        localStorage.setItem("utilisateur_webfit", JSON.stringify(utilisateurBaseDeDonnees));
      }
    } catch (erreur) {
      console.error("Erreur de connexion au backend:", erreur);
    } finally {
      setChargementEnCours(false);
    }
  };

  const handleLoginClick = () => {
    if (chargementEnCours) return;
    if (!utilisateur && googleLoginRef.current) {
      setChargementEnCours(true);
      document.cookie = "g_state=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      setTimeout(() => {
        try {
          googleLoginRef.current.prompt();
        } catch (error) {
          console.warn("Le prompt Google a été bloqué.");
        }
        setTimeout(() => setChargementEnCours(false), 3000);
      }, 200);
    }
  };

  const gererDeconnexion = () => {
    setUtilisateur(null);
    localStorage.removeItem("utilisateur_webfit");
    setAfficheDeconnexion(false);
    setEstOuvert(false);
    if (window.google) {
      window.google.accounts.id.disableAutoSelect();
    }
  };

  const scrollAvecOffset = (el) => {
    const yCoordinate = el.getBoundingClientRect().top + window.pageYOffset;
    const yOffset = -80; 
    window.scrollTo({ top: yCoordinate + yOffset, behavior: 'smooth' }); 
  };

  return (
    <>
      {/* SECTION : ENTÊTE PRINCIPALE (DESKTOP) */}
      <header className="entete">
        
        {/* LOGO */}
        <div className="entete-logo">
          <Link to="/"><img src={LogoWebFit} alt="WebFit" /></Link>
        </div>

        {/* NAVIGATION DESKTOP */}
        <nav className="menu-desktop-nav">
          <Link 
            to="/" 
            className={(location.pathname === "/" && location.hash === "") ? "active" : ""}
          >
            Accueil
          </Link>

          <NavLink to="/abonnements" className={({ isActive }) => isActive ? "active" : ""}>
            Abonnements
          </NavLink>

          <NavLink to="/coursGroupe" className={({ isActive }) => isActive ? "active" : ""}>
            Cours en groupe
          </NavLink>
          
          <HashLink 
            smooth 
            to="/#aPropos" 
            scroll={scrollAvecOffset}
            className={location.hash === "#aPropos" ? "active" : ""}
          >
            À propos
          </HashLink>
          
          <HashLink 
            smooth 
            to="/#horaire" 
            scroll={scrollAvecOffset}
            className={location.hash === "#horaire" ? "active" : ""}
          >
            Horaires
          </HashLink>
        </nav>

        {/* SECTION DROITE (LOGIN & BURGER) */}
        <div className="entete-droite">
          {utilisateur ? (
            /* INTERFACE UTILISATEUR CONNECTÉ */
            <div 
              className="conteneur-utilisateur"
              onMouseEnter={() => setAfficheDeconnexion(true)}
              onMouseLeave={() => setAfficheDeconnexion(false)}
            >
              <img
                src={utilisateur.photo || utilisateur.picture} 
                alt={utilisateur.nom}
                className="login-icon"
                referrerPolicy="no-referrer"
                style={{ borderRadius: "50%", objectFit: "cover" }}
              />
              {afficheDeconnexion && (
                <div className="menu-deroulant">
                  <span className="nom-utilisateur">{utilisateur.nom}</span>
                  <button className="bouton-deconnexion" onClick={gererDeconnexion}>
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* ICÔNE LOGIN DÉCONNECTÉ */
            <img
              src={Login}
              alt="Login"
              className="login-icon"
              onClick={handleLoginClick}
              style={{ cursor: "pointer" }}
            />
          )}

          <button className="burger" onClick={() => setEstOuvert(true)}>☰</button>
        </div>

        {/* COMPOSANT GOOGLE LOGIN (HIDDEN) */}
        <GoogleLogin ref={googleLoginRef} onSuccess={connexionBackend} />
      </header>

      {/* SECTION : MENU MOBILE */}
      <div className={`menu ${estOuvert ? "open" : ""}`}>
        <button className="close" onClick={() => setEstOuvert(false)}>✕</button>
        
        <div className="menu-logo">
          <Link to="/"><img src={LogoWebFit} alt="WebFit" onClick={() => setEstOuvert(false)} /></Link>
        </div>

        <nav>
          {/* LIENS DE NAVIGATION MOBILE */}
          <Link 
            to="/" 
            onClick={() => setEstOuvert(false)}
            className={(location.pathname === "/" && location.hash === "") ? "active" : ""}
          >
            Accueil
          </Link>
          <NavLink to="/abonnements" onClick={() => setEstOuvert(false)} className={({ isActive }) => isActive ? "active" : ""}>Abonnements</NavLink>
          <NavLink to="/coursGroupe" onClick={() => setEstOuvert(false)} className={({ isActive }) => isActive ? "active" : ""}>Cours en groupe</NavLink>
          
          <HashLink 
            smooth to="/#aPropos" 
            onClick={() => setEstOuvert(false)}
            scroll={scrollAvecOffset}
            className={location.hash === "#aPropos" ? "active" : ""}
          >
            À propos
          </HashLink>
          
          <HashLink 
            smooth to="/#horaire" 
            onClick={() => setEstOuvert(false)}
            scroll={scrollAvecOffset}
            className={location.hash === "#horaire" ? "active" : ""}
          >
            Horaires
          </HashLink>
          
          {/* DÉCONNEXION MOBILE */}
          {utilisateur && (
            <div className="utilisateur-mobile-info">
              <button className="bouton-deconnexion-mobile" onClick={gererDeconnexion}>
                Déconnexion ({utilisateur.nom})
              </button>
            </div>
          )}
        </nav>
      </div>
    </>
  );
}