import "./CoursGroupe.scss";
import { Link } from "react-router-dom";

export default function CoursEnGroupe() {
  const horaireData = [
    { jour: "Lundi", cours: [{ h: "9h-10h", n: "Pilates" }, null, { h: "12h-13h", n: "Zumba" }, { h: "18h-19h", n: "Cardio" }, null] },
    { jour: "Mardi", cours: [null, { h: "10h-11h", n: "Danse" }, null, { h: "17h-18h", n: "Spinning" }, { h: "19h-20h", n: "Zumba" }] },
    { jour: "Mercredi", cours: [{ h: "9h-10h", n: "Pilates" }, null, { h: "12h-13h", n: "Zumba" }, { h: "18h-19h", n: "Spinning" }, null] },
    { jour: "Jeudi", cours: [null, { h: "10h-11h", n: "Danse" }, null, { h: "17h-18h", n: "Zumba" }, { h: "19h-20h", n: "Pilates" }] },
    { jour: "Vendredi", cours: [{ h: "9h-10h", n: "Pilates" }, null, { h: "12h-13h", n: "Zumba" }, { h: "17h-18h", n: "Spinning" }, null] },
  ];

  return (
    <div className="conteneur-cours-groupe">
      {/* AFFICHE HERO */}
      <div className="affiche-entete">
        <div className="hero-phrases">
          <span>WebFit</span>
          <span>Entraînement</span>
          <span>Cours en groupe.</span>
        </div>
      </div>

      <div className="zone-planning">
        <Link to="/" className="bouton-retour">← Retour</Link>

        <div className="carte-horaire">
          <div className="entete-tableau">
            <h1>Horaire des cours</h1>
          </div>

          <div className="corps-tableau">
            <div className="defilement-x">
              <table className="planning-grille">
                <tbody>
                  {horaireData.map((ligne, i) => (
                    <tr key={i}>
                      <td className="case-jour">{ligne.jour}</td>
                      {ligne.cours.map((item, j) => (
                        <td key={j} className={item ? "case-activite" : "case-vide"}>
                          {item && (
                            <div className="info-activite">
                              <span className="nom">{item.n}</span>
                              <span className="heure">{item.h}</span>
                            </div>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}