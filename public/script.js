// Бардык колдонуучуларды алуу
async function getUsers() {
    const response = await fetch("/api/users");

    if (response.ok) {
        const users = await response.json();
        const rows = document.querySelector("tbody");

        rows.innerHTML = "";

        users.forEach(user => rows.append(row(user)));
    }
}


// Бардык каталарды тазалоо (жогорку форма үчүн)
function clearErrors() {
    document.getElementById("userName").classList.remove("error");
    document.getElementById("nameError").textContent = "";

    document.getElementById("userAge").classList.remove("error");
    document.getElementById("ageError").textContent = "";
}


// Атка ката көрсөтүү
function showNameError(message) {
    const nameInput = document.getElementById("userName");

    nameInput.classList.add("error");
    document.getElementById("nameError").textContent = message;
    nameInput.focus();
}


// Возрастка ката көрсөтүү
function showAgeError(message) {
    const ageInput = document.getElementById("userAge");

    ageInput.classList.add("error");
    document.getElementById("ageError").textContent = message;
    ageInput.focus();
}


// Атты текшерүү: true = туура, false = ката
function validateName(userName) {
    const name = userName.trim();

    if (name === "") {
        showNameError("Имя не должно быть пустым");
        return false;
    }

    if (name.length < 2) {
        showNameError("Имя должно содержать минимум 2 символа");
        return false;
    }

    return true;
}


// Жашты текшерүү: true = туура, false = ката
function validateAge(userAge) {
    const age = parseInt(userAge, 10);

    if (isNaN(age)) {
        showAgeError("Возраст должен быть числом");
        return false;
    }

    if (age < 0 || age > 120) {
        showAgeError("Возраст должен быть от 0 до 120");
        return false;
    }

    return true;
}


// Колдонуучу кошуу (жогорку форма аркылуу)
async function createUser(userName, userAge) {
    clearErrors();

    if (!validateName(userName)) {
        return;
    }

    if (!validateAge(userAge)) {
        return;
    }

    try {
        const response = await fetch("/api/users", {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: userName.trim(),
                age: parseInt(userAge, 10)
            })
        });

        const result = await response.json();

        if (!response.ok) {
            showAgeError(result.detail);
            return;
        }

        document.querySelector("tbody").append(row(result));

        reset();

    } catch (error) {
        alert("Ошибка соединения с сервером!");
        console.error(error);
    }
}


// Колдонуучуну өчүрүү
async function deleteUser(id) {
    const response = await fetch(`/api/users/${id}`, {
        method: "DELETE"
    });

    if (response.ok) {
        const user = await response.json();

        document.querySelector(
            `tr[data-rowid='${user.id}']`
        ).remove();
    }
}


// Жогорку форманы тазалоо
function reset() {
    document.getElementById("userId").value = "";
    document.getElementById("userName").value = "";
    document.getElementById("userAge").value = "";

    clearErrors();
}


// Саптын ичинде өзгөртүү: бош талаалар чыгат
function inlineEdit(tr, user) {
    tr.innerHTML = "";

    // Ат үчүн талаа (эски ат подсказка катары көрүнөт)
    const nameTd = document.createElement("td");
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.placeholder = user.name;
    nameTd.append(nameInput);
    tr.append(nameTd);

    // Жаш үчүн талаа
    const ageTd = document.createElement("td");
    const ageInput = document.createElement("input");
    ageInput.type = "number";
    ageInput.placeholder = user.age;
    ageTd.append(ageInput);
    tr.append(ageTd);

    // Баскычтар
    const btnTd = document.createElement("td");

    const saveBtn = document.createElement("button");
    saveBtn.append("Сохранить");

    saveBtn.addEventListener("click", async () => {
        const name = nameInput.value.trim();
        const age = parseInt(ageInput.value, 10);

        nameInput.classList.remove("error");
        ageInput.classList.remove("error");

        if (name.length < 2) {
            nameInput.classList.add("error");
            nameInput.focus();
            return;
        }

        if (isNaN(age) || age < 0 || age > 120) {
            ageInput.classList.add("error");
            ageInput.focus();
            return;
        }

        try {
            const response = await fetch("/api/users", {
                method: "PUT",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ id: user.id, name: name, age: age })
            });

            const result = await response.json();

            if (!response.ok) {
                alert(result.detail);
                return;
            }

            tr.replaceWith(row(result));

        } catch (error) {
            alert("Ошибка соединения с сервером!");
            console.error(error);
        }
    });

    const cancelBtn = document.createElement("button");
    cancelBtn.append("Отмена");

    cancelBtn.addEventListener("click", () => {
        tr.replaceWith(row(user));
    });

    btnTd.append(saveBtn);
    btnTd.append(cancelBtn);
    tr.append(btnTd);

    nameInput.focus();
}


// Таблица үчүн сап түзүү
function row(user) {
    const tr = document.createElement("tr");

    tr.setAttribute("data-rowid", user.id);

    const nameTd = document.createElement("td");
    nameTd.append(user.name);
    tr.append(nameTd);

    const ageTd = document.createElement("td");
    ageTd.append(user.age);
    tr.append(ageTd);

    const linksTd = document.createElement("td");

    const editLink = document.createElement("button");
    editLink.append("Изменить");

    editLink.addEventListener("click", () => {
        inlineEdit(tr, user);
    });

    linksTd.append(editLink);

    const removeLink = document.createElement("button");
    removeLink.append("Удалить");

    removeLink.addEventListener("click", async () => {
        await deleteUser(user.id);
    });

    linksTd.append(removeLink);

    tr.append(linksTd);

    return tr;
}


// Жогорку форманын баскычтары (жаңы адам кошуу үчүн)
document.getElementById("resetBtn").addEventListener("click", reset);

document.getElementById("saveBtn").addEventListener("click", async () => {
    const name = document.getElementById("userName").value;
    const age = document.getElementById("userAge").value;

    await createUser(name, age);
});


// Баштапкы колдонуучуларды алуу
getUsers();