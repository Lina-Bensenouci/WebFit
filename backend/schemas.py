from pydantic import BaseModel

class AbonnementBase(BaseModel):
    nom: str
    prix: int

class AbonnementResponse(AbonnementBase):
    id: int

    class Config:
        from_attributes = True
