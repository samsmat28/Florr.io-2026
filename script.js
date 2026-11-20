const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

let player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 30,
    speed: 3,
    hp: 100,
    score: 0
};

// Лепестки игрока вокруг лица (5 штук по умолчанию)
let petals = [
    { angle: 0, distance: 55, radius: 14, rarity: 0 },
    { angle: (Math.PI * 2) / 5, distance: 55, radius: 14, rarity: 0 },
    { angle: (Math.PI * 4) / 5, distance: 55, radius: 14, rarity: 0 },
    { angle: (Math.PI * 6) / 5, distance: 55, radius: 14, rarity: 0 },
    { angle: (Math.PI * 8) / 5, distance: 55, radius: 14, rarity: 0 }
];

// Инвентарь лепестков
let inventory = [
    { rarity: 0, count: 5, name: "Basic" },
    { rarity: 1, count: 0, name: "-" },
    { rarity: 2, count: 0, name: "-" },
    { rarity: 3, count: 0, name: "-" },
    { rarity: 4, count: 0, name: "-" }
];

let mobs = [];
let drops = []; // Лут на земле

const rarityColors = ["#b0b0b0", "#55ff55", "#5555ff", "#aa00aa", "#ff8800"];
const rarityNames = ["Basic", "Unusual", "Rare", "Epic", "Legendary"];

// Спавн мобов со всех сторон
function spawnMob() {
    if (mobs.length < 6) {
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

// Клик по луту на земле для подбора
window.addEventListener('click', (e) => {
    drops.forEach(drop => {
        let dx = e.clientX - drop.x;
        let dy = e.clientY - drop.y;
        if (Math.sqrt(dx * dx + dy * dy) < drop.radius + 15) {
            drop.collected = true;
            for (let i = 0; i < inventory.length; i++) {
                if (inventory[i].rarity === drop.rarity || inventory[i].count === 0) {
                    inventory[i].rarity = drop.rarity;
                    inventory[i].name = rarityNames[drop.rarity];
                    inventory[i].count += 1;
                    break;
                }
            }
            updateInventoryUI();
        }
    });
});

// Крафт стол (5 одинаковых -> 1 выше)
window.craftPetal = function(index) {
    let item = inventory[index];
    if (item.count >= 5 && index < 4) {
        item.count -= 5;
        if (item.count === 0) item.name = "-";
        
        let nextIndex = index + 1;
        inventory[nextIndex].rarity = item.rarity + 1;
        inventory[nextIndex].name = rarityNames[item.rarity + 1];
        inventory[nextIndex].count += 1;
        
        updateInventoryUI();
    }
};

function updateInventoryUI() {
    for (let i = 0; i < 5; i++) {
        let item = inventory[i];
        let countEl = document.getElementById(`count-${i}`);
        let slotEl = document.getElementById("inventory").children[i];
        
        countEl.innerText = item.count > 0 ? item.count : "0";
        slotEl.querySelector(".slot-name").innerText = item.count > 0 ? item.name : "-";
        
        if (item.count > 0) {
            slotEl.style.borderColor = rarityColors[item.rarity];
        } else {
            slotEl.style.borderColor = "rgba(255, 255, 255, 0.3)";
        }
    }
}

function update() {
    let dx = mouse.x - player.x;
    let dy = mouse.y - player.y;
    let dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 1) {
        player.x += (dx / dist) * Math.min(player.speed, dist);
        player.y += (dy / dist) * Math.min(player.speed, dist);
    }

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
            }
        }

        petals.forEach(p => {
            let px = player.x + Math.cos(p.angle) * p.distance;
            let py = player.y + Math.sin(p.angle) * p.distance;
            let pdx = mob.x - px;
            let pdy = mob.y - py;
            if (Math.sqrt(pdx * pdx + pdy * pdy) < p.radius + mob.radius) {
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

    // Игрок (лицо MN)
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
    ctx.arc(player.x - 9, player.y - 4, 4, 0, Math.PI * 2);
    ctx.arc(player.x + 9, player.y - 4, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(player.x - 9, player.y - 4, 1.5, 0, Math.PI * 2);
    ctx.arc(player.x + 9, player.y - 4, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Лепестки вокруг игрока
    petals.forEach(p => {
        let px = player.x + Math.cos(p.angle) * p.distance;
        let py = player.y + Math.sin(p.angle) * p.distance;

        ctx.fillStyle = rarityColors[p.rarity];
        ctx.beginPath();
        ctx.arc(px, py, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.stroke();
    });
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

updateInventoryUI();
loop();
