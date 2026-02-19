import "./PageUnAbonnement.scss";
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

const API_URL = "http://localhost:8000";

export default function PageUnAbonnement() {
  const { id } = useParams();
  const [abonnements, setAbonnements] = useState([]);
  const [erreur, setErreur] = useState(null);
  const [termine, setTermine] = useState(false);

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
        setTermine(true);
      }
    };
    fetchAbonnements();
  }, []);

  if (erreur) return <div className="page-etat"><p>Erreur : {erreur}</p></div>;
  if (!termine) return null;

  const abonnement = abonnements.find(a => a.id === parseInt(id));
  if (!abonnement) return <div className="page-etat"><p>Aucun abonnement trouvé.</p></div>;

  // Définition des types d'abonnements pour l'affichage
  const estAnnuel = [3, 4, 5, 6].includes(abonnement.id);
  const estTrimestriel = abonnement.id === 2;

  return (
    <div className="abonnement-page-container">
      {/* SECTION AFFICHE AVEC TITRE DYNAMIQUE */}
      <div className="affiche-abonnement">
        <div className="hero-phrases">
          <span>WebFit</span>
          <span>Ton Panier</span>
          <span>{abonnement.nom}.</span>
        </div>
      </div>

      <div className="abonnement">
        {/* Bouton retour vers la page précédente */}
        <Link to="/abonnements" className="btn-retour">← Retour aux offres</Link>

        <div className="abonnement-detail-carte">
          <div className="abonnement-titre">
            <h1>{abonnement.nom}</h1>
          </div>

          <div className="abonnement-corps">
            <div className="prix-container">
              <span className="prix-focus">{abonnement.prix}$</span>
              <span className="frequence-detail">
                {estAnnuel ? " / an" : estTrimestriel ? " / 3 mois" : " / mois"}
              </span>
            </div>

            <div className="avantages-section">
              <h3>Ce qui est inclus :</h3>
              <ul>
                {(abonnement.avantages || []).map((avantage, index) => (
                  <li key={index}>{avantage}</li>
                ))}
              </ul>
            </div>

            <button className="bouton-abonner">S'abonner maintenant</button>
          </div>
        </div>
      </div>
    </div>
  );
}