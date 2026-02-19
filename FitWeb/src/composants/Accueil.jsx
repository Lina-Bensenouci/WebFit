import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Accueil.scss";

export default function Accueil() {
  const [abonnements, setAbonnements] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/abonnements")
      .then((res) => res.json())
      .then((data) => {
        // On sélectionne précisément les IDs 1, 2 et 6
        const selectionnes = data
          .filter(abo => [1, 2, 6].includes(abo.id))
          .sort((a, b) => {
            const ordre = { 1: 1, 2: 2, 6: 3 }; // Définit l'ordre d'affichage
            return ordre[a.id] - ordre[b.id];
          });
        
        setAbonnements(selectionnes);
      })
      .catch((err) => console.error("Erreur chargement abonnements:", err));
  }, []);

  return (
    <div className="accueil">
      {/* SECTION HERO */}
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
          <span className="hero-slogan">
            WebFit transforme tes objectifs en résultats.
          </span>
        </div>
      </div>

      <div className="accueil-contenu">
        {/* SECTION À PROPOS */}
        <div className="accueil-a-propos">
          <h1 id="aPropos">À propos de WebFit</h1>
          <p>
            Chez WebFit, nous croyons que chacun a une force en lui, parfois cachée. 
            Ici, peu importe ton niveau : ce qui compte, c’est ta volonté de te dépasser. 
            Nous sommes là pour t’encourager et célébrer chaque victoire avec toi. 
            WebFit, l’endroit où l’effort devient fierté et les objectifs deviennent réalité.
          </p>
          <div className="image-a-propos"></div>
        </div>

        {/* SECTION ABONNEMENTS */}
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
                    {/* "À partir de" seulement pour l'ID 6 */}
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
       {/* SECTION : CE QUE WEBFIT VOUS RÉSERVE */}
        <div className="conteneur-reserve">
          <div className="en-tete-reserve">
            <h1>Tout ce que WebFit te réserve</h1>
          </div>

          {/* Sous-section : Équipements */}
          <div className="bloc-reserve" id="equipements">
            <h2>Entraîne-toi sans pression</h2>
              <p>
                Chez WebFit, pas de jugement, juste un espace sûr pour te dépasser à ton rythme et te sentir bien dès le premier jour.
              </p>
            <div className="image-reserve img-equipements"></div>
          </div>

          {/* Sous-section : Cours en groupe */}
          <div className="bloc-reserve" id="cours-groupe">
            <h2>Cours en groupe</h2>
            <p> Rejoignez notre communauté dynamique ! Des séances variées et énergiques animées par des coachs passionnés pour brûler des calories dans le plaisir. </p>
            <div className="image-reserve img-cours"></div>
          </div>

          {/* Sous-section : Section femme */}
          <div className="bloc-reserve" id="section-femme">
            <h2>Section pour femme</h2>
            <p>
              Profite de notre section femme, un espace intime et accueillant pour t’entraîner en toute confiance, à ton rythme.
            </p>
            <div className="image-reserve img-femme"></div>
          </div>
        </div>
      </div>
    </div>
  );
}