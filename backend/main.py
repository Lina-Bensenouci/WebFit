from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import json

app = FastAPI()

# Autoriser React à appeler l’API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/abonnements")
def get_abonnements():
    with open("abonnements.json", "r", encoding="utf-8") as f:
        data = json.load(f)
    return data["abonnements"]
