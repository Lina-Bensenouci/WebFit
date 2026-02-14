from sqlalchemy import Column, Integer, String
from sqlalchemy.types import JSON
from database import Base

class Abonnement(Base):
    __tablename__ = "abonnements"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String, nullable=False)
    prix = Column(Integer, nullable=False)
    avantages = Column(JSON, nullable=False, default=[])

class Utilisateur(Base):
    __tablename__ = "utilisateurs"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False)
    nom = Column(String, nullable=True)
    photo = Column(String, nullable=True)
    google_id = Column(String, unique=True, index=True, nullable=False)
