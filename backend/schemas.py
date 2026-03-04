from pydantic import BaseModel
from typing import List, Optional

# Format du jeton envoyé par Google
class TokenSchema(BaseModel):
    token: str

# Structure de base d'un abonnement
class AbonnementBase(BaseModel):
    nom: str
    prix: int
    avantages: List[str] = []

# Réponse envoyée au site (avec l'ID)
class AbonnementResponse(AbonnementBase):
    id: int
    class Config:
        from_attributes = True

# Infos utilisateur renvoyées après connexion
class UtilisateurResponse(BaseModel):
    id: int
    nom: Optional[str]
    email: str
    photo: Optional[str]
    google_id: str
    class Config:
        from_attributes = True

# Ce qu'on peut modifier pour un horaire
class HoraireUpdate(BaseModel):
    ouverture: str
    fermeture: str

# Format complet de l'horaire pour le Footer
class HoraireResponse(BaseModel):
    id: int
    jour: str
    ouverture: str
    fermeture: str
    ordre: int
    class Config:
        from_attributes = True