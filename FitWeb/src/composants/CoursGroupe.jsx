import "./CoursGroupe.scss";

export default function CoursEnGroupe() {
  return (
    <div className="cours-en-groupe">
      {/* Titre */}
      <h1>Mettre titre ici</h1>

      {/* Affiche */}
      <div className="image-cours">
        {/* Image ici */}
      </div>

      {/* Contenu : tableau des horaires */}
      <div className="contenu-cours">
        <h2>Horaire</h2>
        <table>
          <thead>
            <tr>
              <th>Jour</th>
              <th>Heure</th>
            </tr>
          </thead>
          <tbody>
            {/* Lignes des jours et heures ici */}
          </tbody>
        </table>
      </div>
    </div>
  );
}

