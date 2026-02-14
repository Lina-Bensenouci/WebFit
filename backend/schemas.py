# schemas.py
from pydantic import BaseModel
from typing import List, Optional

# -------------------
# Pour Google Login
# -------------------
# Reçu depuis le frontend
class TokenSchema(BaseModel):
    token: str

# -------------------
# Pour les abonnements
# -------------------
class AbonnementBase(BaseModel):
    nom: str
    prix: int
    avantages: List[str] = []

class AbonnementResponse(AbonnementBase):
    id: int

    class Config:
        from_attributes = True

# -------------------
# Pour les utilisateurs (optionnel mais pratique)
# -------------------
class UtilisateurResponse(BaseModel):
    id: int
    nom: Optional[str]
    email: str
    photo: Optional[str]
    google_id: str

    class Config:
        from_attributes = True