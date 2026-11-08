import os

from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import DeclarativeBase, sessionmaker


# Vercel'де DATABASE_URL environment variable'ден алынат.
# Локалдуу иштегенде DATABASE_URL жок болсо, SQLite колдонулат.
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./sql_app.db")

# Кээ бир провайдерлер "postgres://" берет, SQLAlchemy "postgresql://" күтөт
if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace(
        "postgres://", "postgresql://", 1
    )

# check_same_thread параметри SQLite үчүн гана керек
connect_args = {}
if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,  # serverless'те үзүлгөн байланышты кайра ачат
)


class Base(DeclarativeBase):
    pass


class Person(Base):
    __tablename__ = "people"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    age = Column(Integer)


#!создаёт сессию (Session) для работы с базой данных
SessionLocal = sessionmaker(
    autoflush=False,
    bind=engine
)