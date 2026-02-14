# main.py
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import engine, Base, SessionLocal
import models
import schemas
from schemas import TokenSchema, UtilisateurResponse

# Google auth
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

# SQLAdmin imports
from sqladmin import Admin, ModelView
from sqladmin.authentication import AuthenticationBackend
from starlette.requests import Request
from starlette.middleware.sessions import SessionMiddleware
from starlette.responses import RedirectResponse

# -------------------
# FastAPI App
# -------------------
app = FastAPI()

# -------------------
# CORS pour React
# -------------------
# ⚠️ Important : autoriser uniquement ton frontend en dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # URL du frontend React
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------
# Session Middleware (nécessaire pour SQLAdmin)
# -------------------
app.add_middleware(SessionMiddleware, secret_key="change_this_to_a_random_string_123456")

# -------------------
# Création des tables
# -------------------
# ⚠️ Importer explicitement toutes les tables
from models import Abonnement, Utilisateur
Base.metadata.create_all(bind=engine)

# -------------------
# DB Dependency
# -------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# -------------------
# Routes publiques
# -------------------
@app.get("/abonnements")
def lire_abonnements(db: Session = Depends(get_db)):
    abonnements = db.query(models.Abonnement).all()
    result = []
    for a in abonnements:
        # Nettoie la liste des avantages
        avantages = [av.strip() for av in a.avantages]
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
        # Vérifie le token Google
        idinfo = id_token.verify_oauth2_token(
            token_data.token,
            google_requests.Request(),
            GOOGLE_CLIENT_ID
        )

        email = idinfo.get("email")
        name = idinfo.get("name")
        picture = idinfo.get("picture")
        google_id = idinfo.get("sub")

        # Vérifie si l'utilisateur existe déjà
        user = db.query(models.Utilisateur).filter(models.Utilisateur.email == email).first()
        if not user:
            user = models.Utilisateur(
                nom=name,
                email=email,
                photo=picture,
                google_id=google_id
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        return user

    except ValueError as e:
        # Token invalide ou expiré
        raise HTTPException(status_code=400, detail=f"Token Google invalide: {str(e)}")
    except Exception as e:
        # Autres erreurs serveur
        raise HTTPException(status_code=500, detail=f"Erreur serveur: {str(e)}")

# -------------------
# Admin SQLAdmin
# -------------------
class SimpleAuthBackend(AuthenticationBackend):
    def __init__(self):
        super().__init__(secret_key="change_this_to_a_random_string_123456")

    async def login(self, request: Request):
        form = await request.form()
        username = form.get("username")
        password = form.get("password")
        if username == "admin" and password == "admin":
            request.session["user"] = username
            return RedirectResponse(url="/admin", status_code=302)
        return RedirectResponse(url="/admin/login", status_code=302)

    async def logout(self, request: Request):
        request.session.pop("user", None)
        return RedirectResponse(url="/admin/login", status_code=302)

    async def authenticate(self, request: Request):
        user = request.session.get("user")
        if user:
            return {"username": user}
        return None

auth_backend = SimpleAuthBackend()

admin = Admin(
    app,
    engine,
    authentication_backend=auth_backend,
    title="WebFit Admin"
)

# Admin view pour les abonnements
class AbonnementAdmin(ModelView, model=models.Abonnement):
    column_list = [models.Abonnement.id, models.Abonnement.nom, models.Abonnement.prix]

# Admin view pour les utilisateurs
class UtilisateurAdmin(ModelView, model=models.Utilisateur):
    column_list = [models.Utilisateur.id, models.Utilisateur.nom, models.Utilisateur.email]

admin.add_view(AbonnementAdmin)
admin.add_view(UtilisateurAdmin)
