from sqlalchemy import Column, Integer, String, ForeignKey, Boolean
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()

class Marka(Base):
    __tablename__ = 'marki'

    id = Column(Integer, primary_key=True, autoincrement=True)
    nazwa = Column(String(50), nullable=False, unique=True)
    rok_zalozenia = Column(Integer, nullable=False)
    czy_istnieje = Column(Boolean, nullable=False)

    def __repr__(self):
        return f"<Marka(id='{self.id}', nazwa='{self.nazwa}', rok_zalozenia='{self.rok_zalozenia}', czy_istnieje='{self.czy_istnieje}')>"