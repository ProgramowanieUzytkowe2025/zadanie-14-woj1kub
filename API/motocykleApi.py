import uvicorn
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy import create_engine, select
from pydantic import BaseModel
from typing import List, Optional
import urllib.parse
import time

from marki import Marka, Base


class MarkaBase(BaseModel):
    """Model bazowy dla marki, używany do tworzenia i odczytu."""
    nazwa: str
    rok_zalozenia: int
    czy_istnieje: bool

class MarkaCreate(MarkaBase):
    """Model używany do tworzenia nowej marki w żądaniu POST."""
    pass

class MarkaUpdate(BaseModel):
    """Model używany do aktualizacji marki; wszystkie pola są opcjonalne."""
    nazwa: Optional[str] = None
    rok_zalozenia: Optional[int] = None
    czy_istnieje: Optional[bool] = None

class MarkaResponse(MarkaBase):
    """Model używany w odpowiedziach API, zawiera ID."""
    id: int

    class Config:
        from_attributes = True


odbc_str = (
    r"Driver={ODBC Driver 17 for SQL Server};"
    r"Server=(localdb)\MSSQLLocalDB;"
    r"Database=Motocykle;"
    r"Trusted_Connection=yes;"
    r"Encrypt=no;"
)
conn_str = "mssql+pyodbc:///?odbc_connect=" + urllib.parse.quote_plus(odbc_str)
engine = create_engine(conn_str)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

app = FastAPI()

# Pozwól na żądania z aplikacji frontendowej (np. React na porcie 3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/marki/", response_model=MarkaResponse, status_code=status.HTTP_201_CREATED)
def create_marka(marka: MarkaCreate, db: Session = Depends(get_db)):
    """Tworzy nową markę w bazie danych."""
    db_marka_existing = db.execute(select(Marka).filter(Marka.nazwa == marka.nazwa)).scalar_one_or_none()
    if db_marka_existing:
        raise HTTPException(status_code=400, detail="Marka o tej nazwie już istnieje.")
    
    db_marka = Marka(**marka.model_dump())
    db.add(db_marka)
    db.commit()
    db.refresh(db_marka)
    return db_marka

@app.get("/marki/", response_model=List[MarkaResponse])
def read_marki(skip: int = 0, limit: int = 100, czy_istnieje: Optional[bool] = None, db: Session = Depends(get_db)):
    """Pobiera listę marek z opcjonalnym filtrem po polu `czy_istnieje`."""
    stmt = select(Marka).order_by(Marka.id)
    if czy_istnieje is not None:
        stmt = stmt.filter(Marka.czy_istnieje == czy_istnieje)
    marki = db.execute(stmt.offset(skip).limit(limit)).scalars().all()
    return marki

@app.get("/marki/{marka_id}", response_model=MarkaResponse)
def read_marka(marka_id: int, db: Session = Depends(get_db)):
    """Pobiera jedną markę po jej ID."""
    time.sleep(2)  # Sztuczne opóźnienie 2 sekundy
    db_marka = db.get(Marka, marka_id)
    if db_marka is None:
        raise HTTPException(status_code=404, detail="Marka nie została znaleziona.")
    return db_marka

@app.put("/marki/{marka_id}", response_model=MarkaResponse)
def update_marka(marka_id: int, marka: MarkaUpdate, db: Session = Depends(get_db)):
    """Aktualizuje istniejącą markę."""
    db_marka = db.get(Marka, marka_id)
    if db_marka is None:
        raise HTTPException(status_code=404, detail="Marka nie została znaleziona.")
    
    update_data = marka.model_dump(exclude_unset=True)
    # Serwerowa walidacja: nie pozwalamy na ustawienie zbyt małego roku założenia
    if 'rok_zalozenia' in update_data and update_data['rok_zalozenia'] is not None:
        if update_data['rok_zalozenia'] < 1900:
            raise HTTPException(status_code=400, detail='rok_zalozenia musi być >= 1900')
    for key, value in update_data.items():
        setattr(db_marka, key, value)
    
    db.add(db_marka)
    db.commit()
    db.refresh(db_marka)
    return db_marka

@app.delete("/marki/{marka_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_marka(marka_id: int, db: Session = Depends(get_db)):
    """Usuwa markę z bazy danych."""
    db_marka = db.get(Marka, marka_id)
    if db_marka is None:
        raise HTTPException(status_code=404, detail="Marka nie została znaleziona.")
    # Nie pozwalamy na usunięcie rekordu, jeśli pole `czy_istnieje` jest False
    if not db_marka.czy_istnieje:
        raise HTTPException(status_code=400, detail="Nie można usunąć rekordu oznaczonego jako nieistniejący")
    db.delete(db_marka)
    db.commit()
    return None

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)