import "./PageUnAbonnement.scss";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const API_URL = "http://localhost:8000";

export default function Abonnement() {
  const { id } = useParams();
  const [abonnements, setAbonnements] = useState([]);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/abonnements`)
      .then(res => {
        if (!res.ok) throw new Error(`Erreur serveur (${res.status})`);
        return res.json();
      })
      .then(data => setAbonnements(data))
      .catch(err => setErreur(err.message));
  }, []);

  if (erreur) return <p>Erreur : {erreur}</p>;

  // Filtre l'abonnement sélectionné
  const abonnement = abonnements.find(a => a.id === parseInt(id));

  if (!abonnement) return null; // juste rien si pas trouvé / pas encore chargé

  return (
    <div className="abonnement-page">
      <h1>{abonnement.nom}</h1>
      <p>Prix : {abonnement.prix} $</p>
      <p>Durée : {abonnement.duree}</p>

      <h3>Avantages :</h3>
      <ul>
        {abonnement.avantages.map((avantage, index) => (
          <li key={index}>{avantage}</li>
        ))}
      </ul>

      <button>S'abonner maintenant</button>
    </div>
  );
}
