// Accueil.js
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Accueil.scss";
import FlecheH from "../Images/FlecheH.png";

export default function Accueil() {
  // Stockage des abonnements et de l'état de la flèche
  const [abonnements, setAbonnements] = useState([]);
  const [showScroll, setShowScroll] = useState(false);

  useEffect(() => {
    // Récupération des données depuis ton API Python
    const API_URL = import.meta.env.VITE_API_URL;

    fetch(`${API_URL}/abonnements`)
      .then((res) => res.json())
      .then((data) => {
        // Filtrage pour ne garder que les abonnements 1, 2 et 6
        const selectionnes = data
          .filter(abo => [1, 2, 6].includes(abo.id))
          .sort((a, b) => {
            const ordre = { 1: 1, 2: 2, 6: 3 };
            return ordre[a.id] - ordre[b.id];
          });
        
        setAbonnements(selectionnes);
      })
      .catch((err) => console.error("Erreur API:", err));

    // Vérification de la position du scroll pour afficher la flèche
    const checkScrollTop = () => {
      if (!showScroll && window.pageYOffset > 400) {
        setShowScroll(true);
      } else if (showScroll && window.pageYOffset <= 400) {
        setShowScroll(false);
      }
    };

    // Écouteur de mouvement de scroll
    window.addEventListener("scroll", checkScrollTop);
    return () => window.removeEventListener("scroll", checkScrollTop);
  }, [showScroll]);

  // Action pour remonter en haut de page en douceur
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="accueil">
      {/* Bouton de retour en haut (visible selon le scroll) */}
      <div 
        className={`scroll-to-top ${showScroll ? "visible" : ""}`} 
        onClick={scrollToTop}>
        <img src={FlecheH} alt="Remonter" />
      </div>

      {/* Section principale avec slogan et bouton d'appel à l'action */}
      <div className="hero-affiche">
        <div className="hero-phrases">
          <span>Plus fort.</span>
          <span>Plus discipliné.</span>
          <span>Plus régulier.</span>
        </div>

        <div className="hero-cta">
          <span className="hero-prix">À partir de 35$ par mois</span>
          <Link to="/abonnements">
            <button className="hero-bouton">Abonnez-vous maintenant !</button>
          </Link>
        </div>
      </div>

      <div className="accueil-contenu">
        {/* Présentation textuelle du gym */}
        <div className="accueil-a-propos">
          <h1 id="aPropos">À propos de WebFit</h1>
          <p>L’endroit où l’effort devient fierté et les objectifs réalité.</p>
          <div className="image-a-propos"></div>
        </div>

        {/* Affichage dynamique des cartes d'abonnements */}
        <div className="accueil-abonnements">
          <h1>Nos abonnements</h1>
          <div className="abonnements-grille">
            {abonnements.map((abonnement) => (
              <div key={abonnement.id} className="abonnement-carte">
                <div className="abonnement-titre">
                  <h2>{abonnement.nom}</h2>
                </div>

                <div className="abonnement-corps">
                   <p className="prix-texte">
                    {abonnement.id === 6 && <span className="a-partir">À partir de </span>}
                    {abonnement.prix}$
                    <span className="frequence">
                      {abonnement.id === 1 && " / mois"}
                      {abonnement.id === 2 && " / 3 mois"}
                      {abonnement.id === 6 && " / an"}
                    </span>
                   </p>
                   
                   <h3>Avantages :</h3>
                   <ul>
                     {/* Boucle pour lister chaque avantage de l'abonnement */}
                     {(abonnement.avantages || []).map((avantage, index) => (
                       <li key={index}>{avantage}</li>
                     ))}
                   </ul>

                   <Link to="/abonnements">
                     <button className="abonnement-bouton">Voir les abonnements</button>
                   </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sections visuelles sur les services du gym */}
        <div className="conteneur-reserve">
          <div className="bloc-reserve">
            <h2>Entraîne-toi sans pression</h2>
            <div className="image-reserve img-equipements"></div>
          </div>

          <div className="bloc-reserve">
            <h2>Cours en groupe</h2>
            <div className="image-reserve img-cours"></div>
          </div>
        </div>
      </div>
    </div>
  );
}