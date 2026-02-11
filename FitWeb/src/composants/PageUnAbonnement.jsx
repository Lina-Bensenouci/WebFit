import "./PageUnAbonnement.scss";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const API_URL = "http://localhost:8000";

export default function PageUnAbonnement() {
  const { id } = useParams();
  const [abonnements, setAbonnements] = useState([]);
  const [erreur, setErreur] = useState(null);
  const [termine, setTermine] = useState(false); // indique que fetch est terminé

  useEffect(() => {
    const fetchAbonnements = async () => {
      try {
        const res = await fetch(`${API_URL}/abonnements`);
        if (!res.ok) throw new Error(`Erreur serveur (${res.status})`);
        const data = await res.json();
        setAbonnements(data || []);
      } catch (err) {
        setErreur(err.message);
      } finally {
        setTermine(true); // on marque que fetch est fini
      }
    };

    fetchAbonnements();
  }, []);

  if (erreur) return <p>Erreur : {erreur}</p>;

  // On attend que fetch soit terminé avant d'afficher "aucun abonnement trouvé"
  if (!termine) return null;

  const abonnement = abonnements.find(a => a.id === parseInt(id));

  if (!abonnement) return <p>Aucun abonnement trouvé.</p>;

  return (
    <div className="abonnement-page">
      <h1>{abonnement.nom}</h1>
      <p>Prix : {abonnement.prix} $</p>
      <p>Durée : {abonnement.duree || "Non spécifiée"}</p>

      <h3>Avantages :</h3>
      <ul>
        {(abonnement.avantages || []).map((avantage, index) => (
          <li key={index}>{avantage}</li>
        ))}
      </ul>

      <button>S'abonner maintenant</button>
    </div>
  );
}
