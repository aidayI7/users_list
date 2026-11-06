from database import *
from sqlalchemy.orm import Session
from fastapi import FastAPI, Body, Depends, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles



Base.metadata.create_all(bind=engine)

app = FastAPI()


app.mount("/public", StaticFiles(directory="public"), name="public")


def get_db():
    db = SessionLocal()

    try:
        yield db #!позволяет функции временно приостановиться
    finally:
        db.close()


@app.get("/")
def main():
    return FileResponse("index.html")


@app.get("/api/users")
def get_people(db: Session = Depends(get_db)):
    return db.query(Person).all() #!Получить все записи

@app.post("/api/users")
def create_person(
    data=Body(),
    db: Session = Depends(get_db)
):
    if data["age"] < 18 or data["age"] > 100:
        raise HTTPException(
            status_code=400,
            detail="Возраст должен быть от 18 до 100 лет"
        )

    if len(data["name"]) < 2:
        raise HTTPException(
            status_code=400,
            detail="Имя должно содержать минимум 2 символа"
        )
    person = Person(
        name=data["name"],
        age=data["age"]
    )

    db.add(person)
    db.commit()
    db.refresh(person)

    return person

@app.delete("/api/users/{id}")
def delete_person(id: int, db: Session = Depends(get_db)):
#!query() — метод для выполнения запроса к базе данных
    person = db.query(Person).filter(Person.id == id).first()

    db.delete(person)
    db.commit()

    return person


@app.put("/api/users")
def update_person(id: int = Body(), name: str = Body(), age: int = Body(), db: Session = Depends(get_db)):
    person = db.query(Person).filter(Person.id == id).first()

    if person is None:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    person.name = name
    person.age = age

    db.commit()
    db.refresh(person)

    return person
