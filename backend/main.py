# main.py
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import engine, Base, SessionLocal
import models
import schemas
from schemas import TokenSchema, UtilisateurResponse, HoraireUpdate, HoraireResponse

# Outils pour la connexion avec Google
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

# Outils pour créer l'interface d'administration
from sqladmin import Admin, ModelView
from sqladmin.authentication import AuthenticationBackend
from starlette.requests import Request
from starlette.middleware.sessions import SessionMiddleware
from starlette.responses import RedirectResponse

# On lance l'application
app = FastAPI()

# Autoriser le site React à communiquer avec ce serveur
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://web-fit-indol.vercel.app"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Sécurité pour que l'admin reste connecté pendant sa session (Configuré pour Render HTTPS)
app.add_middleware(
    SessionMiddleware, 
    secret_key="phrase_secrete_du_gym",
    https_only=True,
    same_site="lax"
)

# Création automatique des tables dans le fichier webfit.db
from models import Abonnement, Utilisateur, Horaire 
Base.metadata.create_all(bind=engine)

# Fonction pour ouvrir et fermer la base de données proprement
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Route pour envoyer la liste des abonnements au site
@app.get("/abonnements")
def lire_abonnements(db: Session = Depends(get_db)):
    abonnements = db.query(models.Abonnement).all()
    result = []
    for a in abonnements:
        # Transformation des avantages en liste pour le frontend
        avantages = [av.strip() for av in a.avantages] if a.avantages else []
        result.append({
            "id": a.id, "nom": a.nom, "prix": a.prix, "avantages": avantages
        })
    return result

# Route pour envoyer les horaires au footer du site (triés par ordre)
@app.get("/horaires")
def get_horaires(db: Session = Depends(get_db)):
    return db.query(models.Horaire).order_by(models.Horaire.ordre).all()

# Logique pour la connexion avec un compte Google
GOOGLE_CLIENT_ID = "338498208696-blf1m0mpo43s3ebq6ntpsadbitp3n2mu.apps.googleusercontent.com"

@app.post("/auth/google", response_model=UtilisateurResponse)
def auth_google(token_data: TokenSchema, db: Session = Depends(get_db)):
    try:
        idinfo = id_token.verify_oauth2_token(token_data.token, google_requests.Request(), GOOGLE_CLIENT_ID)
        email = idinfo.get("email")
        user = db.query(models.Utilisateur).filter(models.Utilisateur.email == email).first()
        if not user:
            user = models.Utilisateur(nom=idinfo.get("name"), email=email, photo=idinfo.get("picture"), google_id=idinfo.get("sub"))
            db.add(user)
            db.commit()
            db.refresh(user)
        return user
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erreur Google")

# Système de connexion pour accéder à la page Admin (admin / admin)
class SimpleAuthBackend(AuthenticationBackend):
    def __init__(self, secret_key: str):
        super().__init__(secret_key=secret_key)

    async def login(self, request: Request) -> bool:
        form = await request.form()
        username = form.get("username")
        password = form.get("password")

        if username == "admin" and password == "admin":
            # On stocke l'info dans la session sécurisée
            request.session.update({"token": "admin_access"})
            return True
        return False

    async def logout(self, request: Request) -> bool:
        request.session.clear()
        return True

    async def authenticate(self, request: Request) -> bool:
        token = request.session.get("token")
        return token == "admin_access"

# Initialisation de l'interface d'administration
auth_backend = SimpleAuthBackend(secret_key="cle_secrete_admin")
admin = Admin(app, engine, authentication_backend=auth_backend, title="WebFit Admin")

# Configuration de l'onglet Abonnements dans l'admin
class AbonnementAdmin(ModelView, model=Abonnement): # Utilise le modèle importé directement
    column_list = [Abonnement.id, Abonnement.nom, Abonnement.prix]
    icon = "fa-solid fa-cart-shopping"

# Configuration de l'onglet Utilisateurs dans l'admin
class UtilisateurAdmin(ModelView, model=Utilisateur):
    column_list = [Utilisateur.id, Utilisateur.nom, Utilisateur.email]
    icon = "fa-solid fa-user"

# Configuration de l'onglet Horaires dans l'admin
class HoraireAdmin(ModelView, model=Horaire):
    name_plural = "Horaires"
    icon = "fa-solid fa-clock"
    column_list = [Horaire.ordre, Horaire.jour, Horaire.ouverture, Horaire.fermeture]

# On force la création des tables avant d'ajouter les vues à l'admin
Base.metadata.create_all(bind=engine)

# On ajoute les onglets au menu de l'interface admin
admin.add_view(AbonnementAdmin)
admin.add_view(UtilisateurAdmin)
admin.add_view(HoraireAdmin)

# Route pour permettre à l'admin de modifier les heures d'ouverture
@app.put("/horaires/{id}")
def update_horaire(id: int, schema: HoraireUpdate, db: Session = Depends(get_db)):
    # On cherche l'horaire précis par son ID
    db_horaire = db.query(models.Horaire).filter(models.Horaire.id == id).first()
    if not db_horaire:
        raise HTTPException(status_code=404, detail="Horaire introuvable")
        
    # On met à jour les heures
    db_horaire.ouverture = schema.ouverture
    db_horaire.fermeture = schema.fermeture
    
    # On sauvegarde les changements dans la base de données
    db.commit()
    db.refresh(db_horaire)
    return db_horaire