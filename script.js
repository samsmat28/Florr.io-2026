let score = 0;
let clickPower = 1;
let upgradeCost = 20;
let currentSkinColor = "#ff3b3b";
let currentName = "MN";

function clickFace(event) {
    score += clickPower;
    updateUI();
    
    // Создаем эффект всплывающего числа в месте клика
    createFloatingText(event);

    // Эффект отскока лица
    let face = document.getElementById("target-face");
    face.style.transform = "scale(0.85)";
    setTimeout(() => {
        face.style.transform = "scale(1)";
    }, 50);
}

function createFloatingText(event) {
    let container = document.getElementById("game-container");
    let floatEl = document.createElement("div");
    floatEl.className = "floating-text";
    floatEl.innerText = "+" + clickPower;

    // Рандомное смещение чтобы цифры не летели строго в одну точку
    let randomX = (Math.random() - 0.5) * 60;
    let randomY = (Math.random() - 0.5) * 40;

    floatEl.style.left = (container.offsetWidth / 2 + randomX) + "px";
    floatEl.style.top = (container.offsetHeight / 2 + randomY) + "px";

    container.appendChild(floatEl);

    // Удаляем элемент после завершения анимации
    setTimeout(() => {
        floatEl.remove();
    }, 600);
}

function buySkin(name, price, color) {
    if (score >= price) {
        score -= price;
        currentName = name;
        currentSkinColor = color;
        
        document.getElementById("face-name").innerText = currentName;
        document.getElementById("target-face").style.backgroundColor = currentSkinColor;
        document.getElementById("target-face").style.boxShadow = `0 0 35px ${color}`;
        
        updateUI();
    } else {
        alert("Не хватает очков!");
    }
}

function upgradeClick() {
    if (score >= upgradeCost) {
        score -= upgradeCost;
        clickPower += 1;
        upgradeCost = Math.floor(upgradeCost * 1.5);
        updateUI();
    } else {
        alert("Не хватает очков для улучшения!");
    }
}

function updateUI() {
    document.getElementById("score").innerText = score;
    document.getElementById("click-power").innerText = clickPower;
    document.getElementById("upgrade-cost").innerText = upgradeCost;
}
