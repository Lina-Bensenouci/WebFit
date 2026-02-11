// Accueil.jsx
import "./Accueil.scss";
import AutreImage from "../Images/Gym13.png";

export default function Accueil() {
  return (
      <div className="accueil">
        <div className="hero-affiche">
          <div className="hero-cta">
            <span className="hero-prix">À partir de 35$ par mois</span>
            <button className="hero-bouton">Abonnez-vous maintenant !</button>
            <span className="hero-slogan">
              WebFit transforme tes objectifs en résultats.
            </span>
          </div>
        </div>

      {/* Autres contenus de la page */}
      <div className="accueil-contenu">
        <h1 id= "aPropos" >À propos de WebFit</h1>
        <p>Chez WebFit, nous croyons que chacun a une force en lui, parfois cachée. Ici, peu importe ton niveau : ce qui compte, c’est ta volonté de te dépasser. Nous sommes là pour t’encourager et célébrer chaque victoire avec toi.
            WebFit, l’endroit où l’effort devient fierté et les objectifs deviennent réalité.</p>

        {/* Images normales */}
        {/* <img src={AutreImage} alt="Exemple" className="image-normal" /> */}
        <div className="image-a-propos"></div>
      </div>
    </div>
  );
}


