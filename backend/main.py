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

# -------------------
# Abonnements
# 
# Cette fonction récupère la liste de tous les abonnements depuis la base de données.
#
# @app.get("/abonnements") : 
#    - app = notre application FastAPI
#    - get = méthode HTTP pour récupérer des données
#    - "/abonnements" = l'adresse web où on peut accéder à cette fonction (webFit/abonnements)
#
# def lire_abonnements() :
#    - def = mot-clé Python pour définir une nouvelle fonction 
#    - lire_abonnements = le nom qu'on donne à notre fonction
#    - () = les paramètres que la fonction peut recevoir
#
# db: Session = Depends(get_db) :
#    - db = le nom qu'on donne à notre accès à la base de données
#    - Session = l'outil qui maintient la connexion ouverte le temps de lire les données
#    - Depends(get_db) = une outils de FastAPI qui nous "fournit" la connexion toute prête 
#       (L'ouvrir, vérifier qu'elle fonctionne et l'a fermer)
#      au moment précis où on lance la fonction
#
# @returns Une liste d'objets abonnement avec :
#          - id : le numéro unique de l'abonnement  
#          - nom : le nom de l'abonnement (ex: "Premium")
#          - prix : le prix en dollars
#          - avantages : la liste des avantages
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
# Auth Google (Connexion)
# 
# Ce bloc permet à l'utilisateur de se connecter avec son compte Google.
#
# @app.post("/auth/google") :
#    - @description : Crée une route qui attend des données envoyées par le client.
#    - post : On utilise "POST" car on envoie des informations.
#
# @method auth_google(token_data, db) :
#    - @param {TokenSchema} token_data : Le jeton de sécurité envoyé par Google.
#    - @param {Session} db : L'accès à la base de données.
#    - @returns {UtilisateurResponse} : Retourne l'utilisateur (créé ou déjà existant).
#    - @description : Vérifie l'identité du client et l'inscrit en base de données.
#
#    - verify_oauth2_token : On demande à Google si le jeton est valide (Vérification).
#    - .first() : On cherche si l'email de l'utilisateur est déjà dans notre base.
#    - db.add / db.commit : Si l'utilisateur est nouveau, on l'enregistre (Création).
#    - try / except : Si Google est en panne ou que le jeton est faux, on affiche une erreur.
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
#
# Ce bloc gère l'interface de gestion sécurisée qui permet de modifier 
# le contenu du site (abonnements, utilisateurs, horaires) sans coder.
#
# @class SimpleAuthBackend(AuthenticationBackend) : 
#    - @param {str} secret_key : Clé servant à sécuriser les badges d'accès (sessions).
#
# @method login(self, request) :
#    - @param {Request}: Le paquet de données envoyé par le navigateur (contient le formulaire).
#    - @returns {bool} : Retourne True si l'accès est accordé, créant une 'session' (badge d'accès).
#
# @method logout(self, request) :
#    - @param {Request} request : La requête de déconnexion.
#    - Supprime le badge de session pour fermer l'accès proprement.
#
# @method authenticate(self, request) :
#    - @param {Request} request : La requête envoyée à chaque clic sur le site.
#    - @returns {bool} : Vérifie si le badge d'accès est toujours présent dans la mémoire du navigateur.
#
# @class ModelView (AbonnementAdmin, UtilisateurAdmin, etc.) :
#    - Transforme une table de la base de données en tableau visuel.
#    - column_list : Définit les colonnes à afficher à l'écran.
#    - icon : Choisit le logo (FontAwesome) pour le menu latéral.
#
# @example admin.add_view(...) :
#    - Enregistre ces modèles pour qu'ils apparaissent comme boutons dans le menu de gauche.
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

auth_backend = SimpleAuthBackend(secret_key="change_this_to_a_random_string_123456") # À changer pas une suite de lettres et chiffres imprévisibles
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
#
# Ce bloc permet d'afficher et de modifier les heures d'ouverture de la salle.
#
# @method get_horaires(db) :
#    - @param {Session} db : La connexion à la base de données fournie par FastAPI.
#    - @returns {list} : Une liste d'horaires triée par la colonne "ordre" (pour avoir Lundi en premier).
#
# @method update_horaire(id, schema, db) :
#    - @param {int} id : Le numéro unique de l'horaire à modifier.
#    - @param {HoraireUpdate} schema : Le paquet contenant les nouvelles heures (ouverture/fermeture).
#    - @param {Session} db : L'accès à la base de données.
#    - @description : Cherche l'horaire par son ID et met à jour les heures dans la base.
#
# Les étapes clés :
#    - filter(...) : On cherche l'élément précis dans la base de données.
#    - raise HTTPException : On envoie une erreur 404 si l'horaire n'existe pas.
#    - db.commit() : On "enregistre" définitivement les changements dans la base.
#    - db.refresh() : On recharge l'objet pour être sûr qu'il est à jour après l'enregistrement.
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