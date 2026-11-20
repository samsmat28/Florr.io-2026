// База данных редкостей
const RARITIES = [
    { name: "Basic", color: "#b0b0b0", multiplier: 1 },
    { name: "Unusual", color: "#55ff55", multiplier: 2 },
    { name: "Rare", color: "#5555ff", multiplier: 4 },
    { name: "Epic", color: "#aa00aa", multiplier: 8 },
    { name: "Legendary", color: "#ff8800", multiplier: 16 }
];

// База мобов (биомы florr.io)
const MOBS_DATA = {
    garden: [
        { name: "Bee", hp: 25, speed: 1.1, radius: 22, color: "#f1c40f", score: 15 },
        { name: "Ladybug", hp: 40, speed: 0.8, radius: 26, color: "#e74c3c", score: 25 },
        { name: "Wasp", hp: 15, speed: 1.5, radius: 18, color: "#e67e22", score: 20 }
    ]
};
