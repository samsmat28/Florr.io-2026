const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

let player = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    radius: 35,
    hp: 100,
    score: 0
};

window.addEventListener('resize', () => {
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
});

// Лепестки игрока вокруг лица (5 штук по умолчанию)
let petals = [
    { angle: 0, distance: 65, width: 14, height: 24, rarity: 0 },
    { angle: (Math.PI * 2) / 5, distance: 65, width: 14, height: 24, rarity: 0 },
    { angle: (Math.PI * 4) / 5, distance: 65, width: 14, height: 24, rarity: 0 },
    { angle: (Math.PI * 6) / 5, distance: 65, width: 14, height: 24, rarity: 0 },
    { angle: (Math.PI * 8) / 5, distance: 65, width: 14, height: 24, rarity: 0 }
];

// Инвентарь слотов (5 уровней редкости)
let inventory = [
    { rarity: 0, count: 5, name: "Basic" },
    { rarity: 1, count: 0, name: "Unusual" },
    { rarity: 2, count: 0, name: "Rare" },
    { rarity: 3, count: 0, name: "Epic" },
    { rarity: 4, count: 0, name: "Legendary" }
];

let mobs = [];
let drops = [];

const rarityColors = ["#b0b0b0", "#55ff55", "#5555ff", "#aa00aa", "#ff8800"];
const rarityNames = ["Basic", "Unusual", "Rare", "Epic", "Legendary"];

// Спавн мобов со всех сторон
function spawnMob() {
    if (mobs.length < 7) {
        let angle = Math.random() * Math.PI * 2;
        let distance = Math.max(canvas.width, canvas.height) / 2 + 100;
        mobs.push({
            x: player.x + Math.cos(angle) * distance,
            y: player.y + Math.sin(angle) * distance,
            radius: 18,
            hp: 25,
            maxHp: 25,
            speed: 1.2,
            color: "#e74c3c"
        });
    }
}
setInterval(spawnMob, 2500);

// Подбор лута с земли по клику
window.addEventListener('click', (e) => {
    drops.forEach(drop => {
        let dx = e.clientX - drop.x;
        let dy = e.clientY - drop.y;
        if (Math.sqrt(dx * dx + dy * dy) < drop.radius + 15) {
            drop.collected = true;
            // Добавляем в соответствующий слот инвентаря
            let slot = inventory[drop.rarity];
            slot.count += 1;
            updateInventoryUI();
        }
    });
});

// Кнопка крафта (5 штук текущего уровня превращаются в 1 следующего)
window.craftPetal = function(index) {
    if (index >= 4) return; // Последний уровень нельзя улучшить дальше
    let currentItem = inventory[index];
    let nextItem = inventory[index + 1];

    if (currentItem.count >= 5) {
        currentItem.count -= 5;
        nextItem.count += 1;
        updateInventoryUI();
    } else {
        alert("Нужно минимум 5 лепестков этого уровня для крафта!");
    }
};

function updateInventoryUI() {
    for (let i = 0; i < 5; i++) {
        let item = inventory[i];
        let countEl = document.getElementById(`count-${i}`);
        let slotEl = document.getElementById("inventory").children[i];
        
        countEl.innerText = item.count;
        slotEl.querySelector(".slot-name").innerText = item.name;
        
        if (item.count > 0) {
            slotEl.style.borderColor = rarityColors[i];
            slotEl.style.opacity = "1";
        } else {
            slotEl.style.borderColor = "rgba(255, 255, 255, 0.2)";
            slotEl.style.opacity = "0.7";
        }
    }
}

function update() {
    petals.forEach(p => p.angle += 0.04);

    mobs.forEach(mob => {
        let mdx = player.x - mob.x;
        let mdy = player.y - mob.y;
        let mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        
        if (mdist > 1) {
            mob.x += (mdx / mdist) * mob.speed;
            mob.y += (mdy / mdist) * mob.speed;
        }

        if (mdist < player.radius + mob.radius) {
            player.hp -= 0.4;
            if (player.hp <= 0) {
                alert("Игра окончена! Счет: " + player.score);
                player.hp = 100;
                player.score = 0;
                mobs = [];
                drops = [];
                // Сброс инвентаря
                inventory.forEach((inv, idx) => inv.count = (idx === 0 ? 5 : 0));
                updateInventoryUI();
            }
        }

        petals.forEach(p => {
            let px = player.x + Math.cos(p.angle) * p.distance;
            let py = player.y + Math.sin(p.angle) * p.distance;
            let pdx = mob.x - px;
            let pdy = mob.y - py;
            if (Math.sqrt(pdx * pdx + pdy * pdy) < p.width + mob.radius - 5) {
                mob.hp -= 8;
                if (mob.hp <= 0) {
                    mob.dead = true;
                }
            }
        });
    });

    mobs.forEach(mob => {
        if (mob.dead) {
            player.score += 15;
            let rand = Math.random() * 100;
            let dropRarity = 0;
            if (rand > 80 && rand <= 95) dropRarity = 1;
            else if (rand > 95 && rand < 99) dropRarity = 2;
            else if (rand >= 99) dropRarity = 3;

            drops.push({
                x: mob.x,
                y: mob.y,
                radius: 12,
                rarity: dropRarity,
                collected: false
            });
        }
    });
    mobs = mobs.filter(mob => !mob.dead);
    drops = drops.filter(drop => !drop.collected);

    document.getElementById("score").innerText = player.score;
    document.getElementById("hp").innerText = Math.max(0, Math.floor(player.hp));
}

function drawPetal(x, y, angle, rarity, width, height) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle + Math.PI / 2);

    ctx.fillStyle = rarityColors[rarity];
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.moveTo(0, -height);
    ctx.bezierCurveTo(width, -height / 2, width, height / 2, 0, height);
    ctx.bezierCurveTo(-width, height / 2, -width, -height / 2, 0, -height);
    ctx.closePath();

    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    ctx.beginPath();
    ctx.arc(0, -height / 3, width / 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Лут на земле
    drops.forEach(drop => {
        ctx.fillStyle = rarityColors[drop.rarity];
        ctx.beginPath();
        ctx.arc(drop.x, drop.y, drop.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.stroke();
    });

    // Мобы
    mobs.forEach(mob => {
        ctx.fillStyle = mob.color;
        ctx.beginPath();
        ctx.arc(mob.x, mob.y, mob.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.stroke();

        let barW = mob.radius * 2;
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(mob.x - barW / 2, mob.y - mob.radius - 10, barW, 4);
        ctx.fillStyle = "#2ecc71";
        ctx.fillRect(mob.x - barW / 2, mob.y - mob.radius - 10, barW * (mob.hp / mob.maxHp), 4);
    });

    // Игрок по центру
    ctx.fillStyle = "#ff3b3b";
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Глаза
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(player.x - 10, player.y - 5, 5, 0, Math.PI * 2);
    ctx.arc(player.x + 10, player.y - 5, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(player.x - 10, player.y - 5, 2, 0, Math.PI * 2);
    ctx.arc(player.x + 10, player.y - 5, 2, 0, Math.PI * 2);
    ctx.fill();

    // Лепестки
    petals.forEach(p => {
        let px = player.x + Math.cos(p.angle) * p.distance;
        let py = player.y + Math.sin(p.angle) * p.distance;
        drawPetal(px, py, p.angle, p.rarity, p.width, p.height);
    });
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

updateInventoryUI();
loop();
