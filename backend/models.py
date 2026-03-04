# models.py
from sqlalchemy import Column, Integer, String
from sqlalchemy.types import JSON
from database import Base

# Table pour stocker les différents forfaits du gym
class Abonnement(Base):
    __tablename__ = "abonnements"

    # L'ID est comme un numéro de dossier unique pour chaque abonnement
    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String, nullable=False)
    prix = Column(Integer, nullable=False)
    # JSON permet de stocker une liste d'avantages (ex: ["Douche", "Wifi"])
    avantages = Column(JSON, nullable=False, default=[])

# Table pour stocker les informations des clients (via Google)
class Utilisateur(Base):
    __tablename__ = "utilisateurs"

    id = Column(Integer, primary_key=True, index=True)
    # unique=True empêche d'avoir deux fois le même email dans la base
    email = Column(String, unique=True, nullable=False)
    nom = Column(String, nullable=True)
    photo = Column(String, nullable=True)
    google_id = Column(String, unique=True, index=True, nullable=False)

# Table pour les heures d'ouverture affichées dans le pied de page
class Horaire(Base):
    __tablename__ = "horaires"

    id = Column(Integer, primary_key=True, index=True)
    # Le nom du jour (ex: Lundi)
    jour = Column(String, unique=True)
    ouverture = Column(String)
    fermeture = Column(String)
    # Un chiffre pour ranger les jours dans l'ordre (ex: 0 pour Lundi)
    ordre = Column(Integer)