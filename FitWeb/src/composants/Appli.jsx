// Appli.jsx
import './Appli.scss';
import Entete from './Entete.jsx';
import Accueil from './Accueil.jsx';
import PageAbonnements from './PageAbonnements.jsx';

// Importation Routes et Route
import { Routes, Route } from 'react-router-dom';

function Appli() {
  return (
    <div className="Appli">
      <Entete />

      <Routes>
        <Route path="/" element={<Accueil />} />
        <Route path="/abonnements" element={<PageAbonnements />} />
        {/* Ajouter d'autres page ici */}
      </Routes>
    </div>
  );
}

export default Appli;
