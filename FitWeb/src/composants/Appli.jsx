// Appli.jsx
import './Appli.scss';
import Entete from './Entete.jsx';
import Pied2Page from './Pied2Page.jsx';
import Accueil from './Accueil.jsx';
import PageAbonnements from './PageAbonnements.jsx';
import Abonnement from './PageUnAbonnement.jsx';
import CoursGroupe from './CoursGroupe.jsx';

import { Routes, Route } from 'react-router-dom';

function Appli() {
  return (
    <div className="Appli">
      <Entete />

      <Routes>
        <Route path="/" element={<Accueil />} />
        <Route path="/abonnements" element={<PageAbonnements />} />
        <Route path="/abonnement/:id" element={<Abonnement />} />
        <Route path="/coursGroupe" element={<CoursGroupe />} />
      </Routes>

      <Pied2Page />
    </div>
  );
}

export default Appli;
