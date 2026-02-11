from sqlalchemy import Column, Integer, String
from sqlalchemy.types import JSON
from database import Base

class Abonnement(Base):
    __tablename__ = "abonnements"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String, nullable=False)
    prix = Column(Integer, nullable=False)
    avantages = Column(JSON, nullable=False, default=[])  # <- liste de textes
