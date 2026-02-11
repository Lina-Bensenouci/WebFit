import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./PageAbonnements.scss";

const API_URL = "http://localhost:8000";

export default function PageAbonnements() {
  const [abonnements, setAbonnements] = useState([]);
  const [erreur, setErreur] = useState(null);
  const [termine, setTermine] = useState(false); // indique que fetch est terminé

  useEffect(() => {
    const chargerAbonnements = async () => {
      try {
        const response = await fetch(`${API_URL}/abonnements`);
        if (!response.ok) {
          throw new Error(`Erreur serveur (${response.status})`);
        }
        const data = await response.json();
        setAbonnements(data || []);
      } catch (err) {
        setErreur(err.message);
      } finally {
        setTermine(true);
      }
    };

    chargerAbonnements();
  }, []);

  if (erreur) {
    return <p className="erreur">Erreur lors du chargement : {erreur}</p>;
  }

  // On attend que fetch soit terminé avant d'afficher "Aucun abonnement trouvé"
  if (!termine) return null;

  return (
    <div className="page-abonnements">
      <h1>Abonnements disponibles</h1>

      {abonnements.length === 0 ? (
        <p>Aucun abonnement trouvé</p>
      ) : (
        abonnements.map((abonnement) => (
          <div key={abonnement.id} className="abonnement-carte">
            <h2>{abonnement.nom}</h2>
            <p>Prix : {abonnement.prix} $</p>

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
        ))
      )}
    </div>
  );
}
