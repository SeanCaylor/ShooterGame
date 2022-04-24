const canvas = document.querySelector("canvas");
//setting canvas dimensions
canvas.width = innerWidth;
canvas.height = innerHeight;
//canvas context
const c = canvas.getContext("2d");
const g = gsap;
const scoreEl = document.querySelector("#scoreEl");
const bigScoreEl = document.querySelector("#bigScoreEl");
const highScoreEl = document.querySelector("#highScoreEl");
const startGameBtn = document.querySelector("#startGameBtn");
const modalEl = document.querySelector("#modalEl");

class Player {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }
    //draw player on screen
    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
    }
}

class Projectile {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }
    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
    }
    update() {
        this.draw();
        this.x += this.velocity.x;
        this.y += this.velocity.y;
    }
}
class Enemy {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }
    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
    }
    update() {
        this.draw();
        this.x += this.velocity.x;
        this.y += this.velocity.y;
    }
}
const friction = 0.99;
class Particle {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1;
    }
    draw() {
        c.save();
        c.globalAlpha = this.alpha;
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
        c.restore();
    }
    update() {
        this.draw();
        this.velocity.x *= friction;
        this.velocity.y *= friction;
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.alpha -= 0.01;
    }
}

const x = canvas.width / 2;
const y = canvas.height / 2;
let player = new Player(x, y, 10, "white");

let projectiles = [];
let enemies = [];
let particles = [];
function init() {
    player = new Player(x, y, 10, "white");
    projectiles = [];
    enemies = [];
    particles = [];
    score = 0;
    scoreEl.innerHTML = score;
    bigScoreEl.innerHTML = score;
}
function spawnEnemies() {
    setInterval(() => {
        const radius = Math.random() * (50 - 4) + 4;
        let x;
        let y;
        if (Math.random() < 0.5) {
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
            y = Math.random() * canvas.height;
        } else {
            x = Math.random() * canvas.width;
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
        }

        const color = `hsl(${Math.random() * 360}, 50%, 50%)`;
        const angle = Math.atan2(player.y - y, player.x - x);
        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle),
        };
        enemies.push(new Enemy(x, y, radius, color, velocity));
    }, 1000);
}
let animationId;
let score = 0;
function animate() {
    animationId = requestAnimationFrame(animate);
    c.fillStyle = "rgba(0, 0, 0, 0.1)";
    c.fillRect(0, 0, canvas.width, canvas.height);
    player.draw();
    particles.forEach((particle, i) => {
        if (particle.alpha <= 0) particles.splice(i, 1);
        else particle.update();
    });
    projectiles.forEach((projectile, i) => {
        projectile.update();
        if (
            projectile.x + projectile.radius < 0 ||
            projectile.x - projectile.radius > canvas.width ||
            projectile.y + projectile.radius < 0 ||
            projectile.y - projectile.radius > canvas.height
        ) {
            setTimeout(() => {
                projectiles.splice(i, 1);
            });
        }
    });
    enemies.forEach((enemy, i) => {
        enemy.update();

        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
        if (dist - player.radius - enemy.radius <= 0) {
            cancelAnimationFrame(animationId);
            bigScoreEl.innerHTML = score;
            modalEl.style.display = "flex";
        }

        projectiles.forEach((projectile, j) => {
            const dist = Math.hypot(
                projectile.x - enemy.x,
                projectile.y - enemy.y
            );
            if (dist - enemy.radius - projectile.radius < 1) {
                console.log(score);
                score += Math.ceil(
                    enemy.radius * (Math.random() * (11 - 4) + 4)
                );
                scoreEl.innerHTML = score;
                if (score > highScoreEl.innerHTML) {
                    highScoreEl.innerHTML = score;
                }
                for (let i = 0; i < enemy.radius * 2; i++) {
                    particles.push(
                        new Particle(
                            enemy.x,
                            enemy.y,
                            Math.random() * 2,
                            enemy.color,
                            {
                                x: (Math.random() - 0.5) * (Math.random() * 8),
                                y: (Math.random() - 0.5) * (Math.random() * 8),
                            }
                        )
                    );
                }
                if (enemy.radius - 10 > 5) {
                    g.to(enemy, {
                        radius: enemy.radius - 10,
                    });
                    projectiles.splice(j, 1);
                } else {
                    setTimeout(() => {
                        enemies.splice(i, 1);
                        projectiles.splice(j, 1);
                        score += 250;
                        if (score > highScoreEl.innerHTML)
                            highScoreEl.innerHTML = score;
                        scoreEl.innerHTML = score;
                    }, 0);
                }
            }
        });
    });
}

addEventListener("click", (e) => {
    const angle = Math.atan2(e.clientY - player.y, e.clientX - player.x);
    const velocity = {
        x: Math.cos(angle) * 5,
        y: Math.sin(angle) * 5,
    };
    projectiles.push(new Projectile(player.x, player.y, 5, "white", velocity));
});

startGameBtn.addEventListener("click", () => {
    init();
    modalEl.style.display = "none";
    animate();
    spawnEnemies();
});
