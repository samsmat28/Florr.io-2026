const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 25,
    speed: 4,
    hp: 100,
    score: 0
};

let mouse = { x: player.x, y: player.y };
window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

// Простые лепестки
let petals = [
    { angle: 0, distance: 45, radius: 12 },
    { angle: Math.PI / 2, distance: 45, radius: 12 },
    { angle: Math.PI, distance: 45, radius: 12 },
    { angle: (3 * Math.PI) / 2, distance: 45, radius: 12 }
];

let mobs = [];

// Спавн мобов
function spawnMob() {
    if (mobs.length < 5) {
        let angle = Math.random() * Math.PI * 2;
        mobs.push({
            x: player.x + Math.cos(angle) * 300,
            y: player.y + Math.sin(angle) * 300,
            radius: 18,
            hp: 20,
            speed: 1.2
        });
    }
}
setInterval(spawnMob, 2000);

function update() {
    // Движение игрока к мышке
    let dx = mouse.x - player.x;
    let dy = mouse.y - player.y;
    let dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 2) {
        player.x += (dx / dist) * Math.min(player.speed, dist);
        player.y += (dy / dist) * Math.min(player.speed, dist);
    }

    // Вращение лепестков
    petals.forEach(p => p.angle += 0.05);

    // Движение мобов
    mobs.forEach(mob => {
        let mdx = player.x - mob.x;
        let mdy = player.y - mob.y;
        let mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mdist > 1) {
            mob.x += (mdx / mdist) * mob.speed;
            mob.y += (mdy / mdist) * mob.speed;
        }

        // Проверка урона от лепестков (без сложных удалений из массивов)
        petals.forEach(p => {
            let px = player.x + Math.cos(p.angle) * p.distance;
            let py = player.y + Math.sin(p.angle) * p.distance;
            let pdx = mob.x - px;
            let pdy = mob.y - py;
            if (Math.sqrt(pdx * pdx + pdy * pdy) < p.radius + mob.radius) {
                mob.hp -= 1; // Урон по чуть-чуть
            }
        });
    });

    // Удаляем мертвых мобов простой фильтрацией
    let aliveMobs = [];
    mobs.forEach(mob => {
        if (mob.hp > 0) {
            aliveMobs.push(mob);
        } else {
            player.score += 10;
        }
    });
    mobs = aliveMobs;

    document.getElementById("score").innerText = player.score;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Рисуем мобов
    mobs.forEach(mob => {
        ctx.fillStyle = "#ff3b3b";
        ctx.beginPath();
        ctx.arc(mob.x, mob.y, mob.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#fff";
        ctx.stroke();
    });

    // Рисуем игрока
    ctx.fillStyle = "#1E88E5";
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Рисуем лепестки
    petals.forEach(p => {
        let px = player.x + Math.cos(p.angle) * p.distance;
        let py = player.y + Math.sin(p.angle) * p.distance;
        ctx.fillStyle = "#b0b0b0";
        ctx.beginPath();
        ctx.arc(px, py, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#fff";
        ctx.stroke();
    });
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

loop();
