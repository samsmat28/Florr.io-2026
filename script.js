let score = 0;
let clickPower = 1;
let upgradeCost = 20;
let currentSkinColor = "#ff3b3b";
let currentName = "MN";

// Функция клика по смайлику
function clickFace() {
    score += clickPower;
    updateUI();
    
    // Эффект отскока при клике
    let face = document.getElementById("target-face");
    face.style.transform = "scale(0.85)";
    setTimeout(() => {
        face.style.transform = "scale(1)";
    }, 50);
}

// Покупка скинов
function buySkin(name, price, color) {
    if (score >= price) {
        score -= price;
        currentName = name;
        currentSkinColor = color;
        
        // Применяем новый стиль лица
        document.getElementById("face-name").innerText = currentName;
        document.getElementById("target-face").style.backgroundColor = currentSkinColor;
        document.getElementById("target-face").style.boxShadow = `0 0 30px ${color}`;
        
        updateUI();
    } else {
        alert("Не хватает очков!");
    }
}

// Улучшение силы клика
function upgradeClick() {
    if (score >= upgradeCost) {
        score -= upgradeCost;
        clickPower += 1;
        upgradeCost = Math.floor(upgradeCost * 1.5); // Каждое улучшение дороже
        updateUI();
    } else {
        alert("Не хватает очков для улучшения!");
    }
}

// Обновление текста на экране
function updateUI() {
    document.getElementById("score").innerText = score;
    document.getElementById("click-power").innerText = clickPower;
    document.getElementById("upgrade-cost").innerText = upgradeCost;
}
