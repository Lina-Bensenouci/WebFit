# main.py
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import engine, Base, SessionLocal
import models
import schemas

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

# CORS pour React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # ton frontend React
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
        avantages = [av.strip() for av in a.avantages]

        result.append({
            "id": a.id,
            "nom": a.nom,
            "prix": a.prix,
            "avantages": avantages
        })

    return result



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

admin.add_view(AbonnementAdmin)
