import React, { useState, useRef, useEffect } from "react";
import { NavLink, Link } from "react-router-dom";
import "./Entete.scss";
import LogoWebFit from "../Images/Logo4WebFit.png";
import Login from "../Images/Login2.png";
import GoogleLogin from "./GoogleLogin.jsx";

/* ------------------------------
   Composant Entête principal
--------------------------------*/
export default function Entete() {
  const [estOuvert, setEstOuvert] = useState(false); // état du menu burger
  const [utilisateur, setUtilisateur] = useState(null); // état de l'utilisateur connecté
  const [afficheDeconnexion, setAfficheDeconnexion] = useState(false); // état du menu déconnexion
  const [chargementEnCours, setChargementEnCours] = useState(false); // Verrou de sécurité pour FedCM

  const googleLoginRef = useRef();

  // Charger l'utilisateur au démarrage depuis le stockage local (Persistance)
  useEffect(() => {
    const infosSauvegardees = localStorage.getItem("utilisateur_webfit");
    if (infosSauvegardees) {
      setUtilisateur(JSON.parse(infosSauvegardees));
    }
  }, []);

  // Envoi du jeton à FastAPI pour vérification et enregistrement en base de données
  const connexionBackend = async (donneesGoogle) => {
    try {
      const reponse = await fetch("http://localhost:8000/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: donneesGoogle.token }),
      });

      if (reponse.ok) {
        const utilisateurBaseDeDonnees = await reponse.json();
        // On enregistre les données provenant du backend (qui utilise le champ "photo")
        setUtilisateur(utilisateurBaseDeDonnees);
        localStorage.setItem("utilisateur_webfit", JSON.stringify(utilisateurBaseDeDonnees));
      }
    } catch (erreur) {
      // Erreur de connexion au serveur (FastAPI éteint par exemple)
    } finally {
      setChargementEnCours(false);
    }
  };

  // Gestion du login manuel (icône)
  const handleLoginClick = () => {
    if (chargementEnCours) return;

    if (!utilisateur && googleLoginRef.current) {
      setChargementEnCours(true);
      // Nettoie le cookie de blocage de Google (g_state)
      document.cookie = "g_state=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

      // Micro-délai pour stabiliser l'affichage du prompt FedCM et éviter l'AbortError
      setTimeout(() => {
        googleLoginRef.current.prompt();
        setTimeout(() => setChargementEnCours(false), 3000);
      }, 200);
    }
  };

  // Gestion de la déconnexion
  const gererDeconnexion = () => {
    setUtilisateur(null);
    localStorage.removeItem("utilisateur_webfit");
    setAfficheDeconnexion(false);
    setEstOuvert(false);
    if (window.google) {
      window.google.accounts.id.disableAutoSelect();
    }
  };

  return (
    <>
      {/* Header */}
      <header className="entete">
        {/* Logo */}
        <div className="entete-logo">
          <Link to="/"><img src={LogoWebFit} alt="WebFit" /></Link>
        </div>

        {/* Navigation desktop */}
        <nav className="menu-desktop-nav">
          <NavLink to="/" className={({ isActive }) => isActive ? "active" : ""}>Accueil</NavLink>
          <NavLink to="/abonnements" className={({ isActive }) => isActive ? "active" : ""}>Abonnements</NavLink>
          <NavLink to="/coursGroupe" className={({ isActive }) => isActive ? "active" : ""}>Cours en groupe</NavLink>
          <a href="#aPropos">À propos</a>
          <a href="#horaire">Horaires</a>
        </nav>

        {/* Login + Burger mobile */}
        <div className="entete-droite">
          {utilisateur ? (
            <div 
              className="conteneur-utilisateur"
              onMouseEnter={() => setAfficheDeconnexion(true)}
              onMouseLeave={() => setAfficheDeconnexion(false)}
            >
              <img
                src={utilisateur.photo || utilisateur.picture} 
                alt={utilisateur.nom}
                className="login-icon"
                style={{ borderRadius: "50%" }}
              />
              {/* Menu déconnexion bureau */}
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
            <img
              src={Login}
              alt="Login"
              className="login-icon"
              onClick={handleLoginClick}
            />
          )}

          <button className="burger" onClick={() => setEstOuvert(true)}>☰</button>
        </div>

        {/* Composant GoogleLogin invisible */}
        <GoogleLogin ref={googleLoginRef} onSuccess={connexionBackend} />
      </header>

      {/* Menu burger mobile */}
      <div className={`menu ${estOuvert ? "open" : ""}`}>
        <button className="close" onClick={() => setEstOuvert(false)}>✕</button>

        <div className="menu-logo">
          <Link to="/"><img src={LogoWebFit} alt="WebFit" onClick={() => setEstOuvert(false)} /></Link>
        </div>

        <nav>
          <NavLink to="/" onClick={() => setEstOuvert(false)} className={({ isActive }) => isActive ? "active" : ""}>Accueil</NavLink>
          <NavLink to="/abonnements" onClick={() => setEstOuvert(false)} className={({ isActive }) => isActive ? "active" : ""}>Abonnements</NavLink>
          <NavLink to="/coursGroupe" onClick={() => setEstOuvert(false)} className={({ isActive }) => isActive ? "active" : ""}>Cours en groupe</NavLink>
          <a href="#aPropos" onClick={() => setEstOuvert(false)}>À propos</a>
          <a href="#horaire" onClick={() => setEstOuvert(false)}>Horaires</a>
          
          {/* Bouton déconnexion mobile */}
          {utilisateur && (
            <button className="bouton-deconnexion-mobile" onClick={gererDeconnexion}>
              Déconnexion ({utilisateur.nom})
            </button>
          )}
        </nav>
      </div>
    </>
  );
}