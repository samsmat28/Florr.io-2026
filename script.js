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
    radius: 25,
    speed: 3.5,
    hp: 100,
    score: 0
};

let petals = [
    { angle: 0, distance: 45, radius: 12, speed: 0.05 },
    { angle: Math.PI / 2, distance: 45, radius: 12, speed: 0.05 },
    { angle: Math.PI, distance: 45, radius: 12, speed: 0.05 },
    { angle: (3 * Math.PI) / 2, distance: 45, radius: 12, speed: 0.05 }
];

let inventory = [
    { rarity: 0, count: 5 },
    { rarity: 0, count: 0 },
    { rarity: 0, count: 0 },
    { rarity: 0, count: 0 },
    { rarity: 0, count: 0 }
];

let mobs = [];
let drops = [];

const rarityColors = ["#b0b0b0", "#55ff55", "#5555ff"];

function spawnMob() {
    if (mobs.length < 6) {
        let angle = Math.random() * Math.PI * 2;
        let distance = Math.max(canvas.width, canvas.height) / 2 + 100;
        mobs.push({
            x: player.x + Math.cos(angle) * distance,
            y: player.y + Math.sin(angle) * distance,
            radius: 18,
            hp: 30,
            maxHp: 30,
            speed: 1.5,
            color: "#ff3b3b",
            dead: false
        });
    }
}
setInterval(spawnMob, 3000);

window.craftPetal = function(index) {
    let item = inventory[index];
    if (item.count >= 5) {
        item.count -= 5;
        if (index < 4) {
            inventory[index + 1].count += 1;
            inventory[index + 1].rarity = item.rarity + 1;
        }
        updateInventoryUI();
    }
};

function updateInventoryUI() {
    for (let i = 0; i < 5; i++) {
        let slotEl = document.getElementById("inventory").children[i];
        let item = inventory[i];
        let countEl = document.getElementById(`count-${i}`);
        
        countEl.innerText = item.count > 0 ? item.count : "";
        
        if (item.count > 0) {
            slotEl.innerHTML = `<div class="petal-icon rarity-${getRarityClass(item.rarity)}">Леп</div><div class="count-badge">${item.count}</div>`;
        } else {
            slotEl.innerHTML = `<div class="count-badge">0</div>`;
        }
    }
}

function getRarityClass(rarity) {
    if (rarity === 1) return 'unusual';
    if (rarity === 2) return 'rare';
    return 'common';
}

function update() {
    let dx = mouse.x - player.x;
    let dy = mouse.y - player.y;
    let dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 1) {
        player.x += (dx / dist) * Math.min(player.speed, dist);
        player.y += (dy / dist) * Math.min(player.speed, dist);
    }

    petals.forEach(p => p.angle += p.speed);

    mobs.forEach(mob => {
        let mdx = player.x - mob.x;
        let mdy = player.y - mob.y;
        let mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        
        if (mdist > 1) {
            mob.x += (mdx / mdist) * mob.speed;
            mob.y += (mdy / mdist) * mob.speed;
        }

        if (mdist < player.radius + mob.radius) {
            player.hp -= 0.3;
            if (player.hp <= 0) {
                alert("Игра окончена! Счëт: " + player.score);
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
            let pdist = Math.sqrt(pdx * pdx + pdy * pdy);

            if (pdist < p.radius + mob.radius) {
                mob.hp -= 10;
                if (mob.hp <= 0) {
                    mob.dead = true;
                }
            }
        });
    });

    mobs.forEach(mob => {
        if (mob.dead) {
            drops.push({
                x: mob.x,
                y: mob.y,
                radius: 10,
                rarity: 0,
                collected: false
            });
            player.score += 10;
        }
    });
    mobs = mobs.filter(mob => !mob.dead);

    drops.forEach(drop => {
        let ddx = player.x - drop.x;
        let ddy = player.y - drop.y;
        let ddist = Math.sqrt(ddx * ddx + ddy * ddy);

        if (ddist < player.radius + drop.radius + 15) {
            drop.collected = true;
            for (let i = 0; i < inventory.length; i++) {
                if (inventory[i].rarity === drop.rarity || inventory[i].count === 0) {
                    inventory[i].rarity = drop.rarity;
                    inventory[i].count += 1;
                    break;
                }
            }
            updateInventoryUI();
        }
    });
    drops = drops.filter(drop => !drop.collected);

    document.getElementById("score").innerText = player.score;
    document.getElementById("hp").innerText = Math.max(0, Math.floor(player.hp));
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#222";
    ctx.lineWidth = 1;
    let gridSize = 50;
    let startX = -(player.x % gridSize);
    let startY = -(player.y % gridSize);
    for (let x = startX; x < canvas.width; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = startY; y < canvas.height; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    drops.forEach(drop => {
        ctx.fillStyle = rarityColors[drop.rarity];
        ctx.beginPath();
        ctx.arc(drop.x, drop.y, drop.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#fff";
        ctx.stroke();
    });

    mobs.forEach(mob => {
        ctx.fillStyle = mob.color;
        ctx.beginPath();
        ctx.arc(mob.x, mob.y, mob.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.stroke();

        let barWidth = mob.radius * 2;
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(mob.x - barWidth / 2, mob.y - mob.radius - 10, barWidth, 4);
        ctx.fillStyle = "#4CAF50";
        ctx.fillRect(mob.x - barWidth / 2, mob.y - mob.radius - 10, barWidth * (mob.hp / mob.maxHp), 4);
    });

    ctx.fillStyle = "#1E88E5";
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 3;
    ctx.stroke();

    petals.forEach(p => {
        let px = player.x + Math.cos(p.angle) * p.distance;
        let py = player.y + Math.sin(p.angle) * p.distance;

        ctx.fillStyle = rarityColors[0];
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
