from requests import Session
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session
import urllib.parse
from marki import Marka, Base

odbc_str = (
    r"Driver={ODBC Driver 17 for SQL Server};"
    r"Server=(localdb)\MSSQLLocalDB;"
    r"Database=Motocykle;"
    r"Trusted_Connection=yes;"
    r"Encrypt=no;"
)
conn_str = "mssql+pyodbc:///?odbc_connect=" + urllib.parse.quote_plus(odbc_str)

engine = create_engine(conn_str)

new_marki = [
    Marka(nazwa='Honda', rok_zalozenia=1948, czy_istnieje=True),
    Marka(nazwa='Yamaha', rok_zalozenia=1955, czy_istnieje=True),
    Marka(nazwa='Ducati', rok_zalozenia=1926, czy_istnieje=True),
    Marka(nazwa='KTM', rok_zalozenia=1953, czy_istnieje=True),
    Marka(nazwa='BMW', rok_zalozenia=1916, czy_istnieje=True),
    Marka(nazwa='BSA', rok_zalozenia=1910, czy_istnieje=False),  # marka historyczna
]

with Session(engine) as session:
    for m in new_marki:
        istnieje = session.scalar(select(Marka).filter_by(nazwa=m.nazwa))
        if not istnieje:
            session.add(m)
    session.commit()

    # wypisz wszystkie marki z bazy
    print("Marki w bazie:")
    for m in session.scalars(select(Marka)).all():
        print(m)