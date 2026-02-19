import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./PageAbonnements.scss";

const API_URL = "http://localhost:8000";

export default function PageAbonnements() {
  const [abonnements, setAbonnements] = useState([]);
  const [erreur, setErreur] = useState(null);
  const [termine, setTermine] = useState(false);

  useEffect(() => {
    const chargerAbonnements = async () => {
      try {
        const response = await fetch(`${API_URL}/abonnements`);
        if (!response.ok) {
          throw new Error(`Erreur serveur (${response.status})`);
        }
        const data = await response.json();
        const filteredData = (data || []).filter(abo => abo.id !== 6);
        setAbonnements(filteredData);
      } catch (err) {
        setErreur(err.message);
      } finally {
        setTermine(true);
      }
    };
    chargerAbonnements();
  }, []);

  if (erreur) {
    return <div className="page-etat"><p className="erreur">Erreur : {erreur}</p></div>;
  }

  if (!termine) return null;

  return (
    <div className="page-abonnements">
      {/* SECTION AFFICHE AVEC TITRE STYLISÉ */}
      <div className="affiche-abonnements">
        <div className="hero-phrases">
          <span>WebFit</span>
          <span>Découvre</span>
          <span>Nos abonnements.</span>
        </div>
      </div>

      {/* SECTION CONTENU AVEC EFFETS LED */}
      <div className="abonnements">
        <div className="abonnements-grille">
          {abonnements.length === 0 ? (
            <p>Aucun abonnement trouvé</p>
          ) : (
            abonnements.map((abonnement) => (
              <div key={abonnement.id} className="abonnement-carte">
                <div className="abonnement-titre">
                  <h2>{abonnement.nom}</h2>
                </div>
                <div className="abonnement-corps">
                  <p className="prix-texte">
                    {abonnement.prix} $
                    <span className="frequence">
                      {abonnement.id === 2 ? " / 3 mois" : 
                       [3, 4, 5].includes(abonnement.id) ? " / an" : " / mois"}
                    </span>
                  </p>
                  <h3>Avantages :</h3>
                  <ul>
                    {(abonnement.avantages || []).map((avantage, index) => (
                      <li key={index}>{avantage}</li>
                    ))}
                  </ul>
                  <Link to={`/abonnement/${abonnement.id}`} state={{ abonnement }}>
                    <button className="abonnement-bouton">Voir l'abonnement</button>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}