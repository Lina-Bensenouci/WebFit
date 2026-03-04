# main.py
import os # Pour savoir si on est sur Render ou en local
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import engine, Base, SessionLocal
import models
import schemas
from schemas import TokenSchema, UtilisateurResponse, HoraireUpdate, HoraireResponse

# Google auth
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

# SQLAdmin imports
from sqladmin import Admin, ModelView
from sqladmin.authentication import AuthenticationBackend
from starlette.requests import Request
from starlette.middleware.sessions import SessionMiddleware
from starlette.responses import RedirectResponse
# Obligatoire pour pas que Render bloque la connexion
from uvicorn.middleware.proxy_headers import ProxyHeadersMiddleware

# Si la variable RENDER existe, on est en ligne
IS_PROD = os.getenv("RENDER") is not None

# -------------------
# FastAPI App
# -------------------
app = FastAPI()

# Petit correctif pour que Render accepte le HTTPS sans bugger
if IS_PROD:
    app.add_middleware(ProxyHeadersMiddleware, trusted_hosts="*")

# -------------------
# 1. Middleware COOP (Sécurité Google)
# -------------------
@app.middleware("http")
async def add_google_auth_headers(request: Request, call_next):
    response = await call_next(request)
    # Permet à la popup Google de parler au site sans se faire bloquer
    response.headers["Cross-Origin-Opener-Policy"] = "same-origin-allow-popups"
    response.headers["Cross-Origin-Resource-Policy"] = "cross-origin"
    return response

# -------------------
# 2. CORS (Lien avec le React)
# -------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://web-fit-indol.vercel.app"], 
    allow_credentials=True, # Important pour garder la session ouverte
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------
# 3. Session (Le "badge" de connexion)
# -------------------
app.add_middleware(
    SessionMiddleware, 
    secret_key="change_this_to_a_random_string_123456",
    https_only=IS_PROD, # En local pas besoin de HTTPS, sur Render oui
    same_site="lax"
)

# -------------------
# Création des tables
# -------------------
from models import Abonnement, Utilisateur, Horaire
# Crée la base de données automatiquement si elle n'existe pas
Base.metadata.create_all(bind=engine)

# Outil pour se connecter à la DB dans les routes
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() # On ferme toujours pour pas saturer la DB

# -------------------
# Routes publiques (Pour le site)
# -------------------
@app.get("/abonnements")
def lire_abonnements(db: Session = Depends(get_db)):
    abonnements = db.query(models.Abonnement).all()
    result = []
    for a in abonnements:
        # On transforme le texte en liste propre pour le React
        avantages = [av.strip() for av in a.avantages] if a.avantages else []
        result.append({
            "id": a.id,
            "nom": a.nom,
            "prix": a.prix,
            "avantages": avantages
        })
    return result

# -------------------
# Auth Google
# -------------------
GOOGLE_CLIENT_ID = "338498208696-blf1m0mpo43s3ebq6ntpsadbitp3n2mu.apps.googleusercontent.com"

@app.post("/auth/google", response_model=UtilisateurResponse)
def auth_google(token_data: TokenSchema, db: Session = Depends(get_db)):
    try:
        # On vérifie si le token envoyé par le front est valide chez Google
        idinfo = id_token.verify_oauth2_token(
            token_data.token,
            google_requests.Request(),
            GOOGLE_CLIENT_ID
        )

        email = idinfo.get("email")
        name = idinfo.get("name")
        picture = idinfo.get("picture")
        google_id = idinfo.get("sub")

        # Si l'user n'existe pas en DB, on le crée direct
        user = db.query(models.Utilisateur).filter(models.Utilisateur.email == email).first()
        if not user:
            user = models.Utilisateur(nom=name, email=email, photo=picture, google_id=google_id)
            db.add(user)
            db.commit()
            db.refresh(user)
        return user
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur serveur: {str(e)}")

# -------------------
# Admin SQLAdmin (Le tableau de bord)
# -------------------
class SimpleAuthBackend(AuthenticationBackend):
    def __init__(self, secret_key: str):
        super().__init__(secret_key=secret_key)

    async def login(self, request: Request) -> bool:
        form = await request.form()
        username = form.get("username")
        password = form.get("password")

        # Si c'est admin/admin, on crée la session
        if username == "admin" and password == "admin":
            request.session.update({"user": "admin"})
            return True
        return False

    async def logout(self, request: Request) -> bool:
        request.session.clear() # On vide tout quand on quitte
        return True

    async def authenticate(self, request: Request) -> bool:
        # On vérifie si le mot "user" est dans la session pour laisser passer
        return "user" in request.session

auth_backend = SimpleAuthBackend(secret_key="change_this_to_a_random_string_123456")
admin = Admin(app, engine, authentication_backend=auth_backend, title="WebFit Admin")

# --- On définit ce qu'on voit dans l'Admin ---
class AbonnementAdmin(ModelView, model=models.Abonnement):
    column_list = [models.Abonnement.id, models.Abonnement.nom, models.Abonnement.prix]
    icon = "fa-solid fa-cart-shopping"

class UtilisateurAdmin(ModelView, model=models.Utilisateur):
    column_list = [models.Utilisateur.id, models.Utilisateur.nom, models.Utilisateur.email]
    icon = "fa-solid fa-user"

class HoraireAdmin(ModelView, model=models.Horaire):
    name_plural = "Horaires"
    icon = "fa-solid fa-clock"
    column_list = [models.Horaire.ordre, models.Horaire.jour, models.Horaire.ouverture, models.Horaire.fermeture]

# --- On ajoute les boutons dans le menu de gauche ---
admin.add_view(AbonnementAdmin)
admin.add_view(UtilisateurAdmin)
admin.add_view(HoraireAdmin) 

# -------------------
# Routes Horaires (Pour le footer du site)
# -------------------
@app.get("/horaires")
def get_horaires(db: Session = Depends(get_db)):
    # On trie par ordre pour avoir Lundi, Mardi, etc.
    return db.query(models.Horaire).order_by(models.Horaire.ordre).all()

@app.put("/horaires/{id}")
def update_horaire(id: int, schema: HoraireUpdate, db: Session = Depends(get_db)):
    # Route pour modifier une heure via le code ou l'admin
    db_horaire = db.query(models.Horaire).filter(models.Horaire.id == id).first()
    if not db_horaire:
        raise HTTPException(status_code=404, detail="Horaire non trouvé")
        
    db_horaire.ouverture = schema.ouverture
    db_horaire.fermeture = schema.fermeture
    db.commit() # On valide le changement
    db.refresh(db_horaire)
    return db_horaire