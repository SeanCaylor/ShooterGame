const canvas = document.querySelector("canvas");
//setting canvas dimensions
canvas.width = innerWidth;
canvas.height = innerHeight;
//canvas context
const c = canvas.getContext("2d");

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

const x = canvas.width / 2;
const y = canvas.height / 2;
const player = new Player(x, y, 10, "white");

const projectiles = [];
const enemies = [];
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
function animate() {
    animationId = requestAnimationFrame(animate);
    c.fillStyle = "rgba(0, 0, 0, 0.1)";
    c.fillRect(0, 0, canvas.width, canvas.height);
    player.draw();
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
        }

        projectiles.forEach((projectile, j) => {
            const dist = Math.hypot(
                projectile.x - enemy.x,
                projectile.y - enemy.y
            );
            if (dist - enemy.radius - projectile.radius < 1) {
                if (enemy.radius > 10) {
                    enemy.radius -= 10;
                    projectiles.splice(j, 1);
                } else {
                    setTimeout(() => {
                        enemies.splice(i, 1);
                        projectiles.splice(j, 1);
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
animate();
spawnEnemies();
