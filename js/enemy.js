import { isValidMove } from "./board.js";

class Enemy {
    constructor({ x, y }, index, speed = 10) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.wait = 20 - this.speed;
        this.element = null;
        this.lastDirection = "";
        this.index = index; // Store the enemy index
    }

    setElement(element) {
        this.element = element;
        element.style.backgroundSize = "30px";
        this.element.style.gridRow = this.y;
        this.element.style.gridColumn = this.x;
    }

    moveRandomly() {
        this.wait--;
        if (this.wait === 0) {
            this.wait = 20 - this.speed;
            const directions = ['up', 'down', 'left', 'right'];
            const randomDirection = directions[Math.floor(Math.random() * directions.length)];

            switch (randomDirection) {
                case 'up':
                    if (this.lastDirection === "down") return;
                    this.lastDirection = randomDirection;
                    this.move(0, -1);
                    break;
                case 'down':
                    if (this.lastDirection === "up") return;
                    this.lastDirection = randomDirection;
                    this.move(0, 1);
                    break;
                case 'left':
                    if (this.lastDirection === "right") return;
                    this.lastDirection = randomDirection;
                    this.move(-1, 0);
                    break;
                case 'right':
                    if (this.lastDirection === "left") return;
                    this.lastDirection = randomDirection;
                    this.move(1, 0);
                    break;
            }
        }
    }

    move(dx, dy) {
        const newX = this.x + dx;
        const newY = this.y + dy;

        if (isValidMove(newX - 1, newY - 1)) {
            // Set the CSS variables for translation
            this.element.style.setProperty(`--translate-${this.index}-x`, `${this.element.clientWidth * dx}px`);
            this.element.style.setProperty(`--translate-${this.index}-y`, `${this.element.clientHeight * dy}px`);

            // Set the animation name
            this.element.style.animationName = `moveEnemy${this.index}`;

            // Add animationend event listener
            this.element.addEventListener('animationend', () => {
                // Clear the animation properties and CSS variables
                this.element.style.animationName = "none";

                // Update the enemy's position in the DOM
                this.element.style.gridRow = this.y;
                this.element.style.gridColumn = this.x;

            }, { once: true });

            // Update the enemy's position in the game grid
            this.x = newX;
            this.y = newY;
        }
    }

}

// Create an array to store enemies
export const enemies = [];
const enemiesPositions = [
    { x: 6, y: 4 },
    { x: 14, y: 2 },
    { x: 4, y: 10 },
    { x: 7, y: 7 },
    { x: 8, y: 12 },
    { x: 15, y: 15 },
    { x: 8, y: 9 },
    { x: 10, y: 12 },
    { x: 14, y: 4 },
    { x: 9, y: 5 }
];
export let numEnemies = 10;

// Function to create and initialize enemies
export function createEnemies(board) {
    for (let i = 0; i < numEnemies; i++) {
        // Check if position is valid
        let randomPosition = enemiesPositions[i]

        const enemyElement = document.createElement('div');
        enemyElement.classList.add('enemy');
        // You can set enemyElement's initial position styles here
        const speeds = [5, 10, 15];
        const speed = speeds[Math.floor(Math.random() * speeds.length)];
        // enemyElement.innerHTML = speed
        const enemy = new Enemy(randomPosition, i, speed);
        enemy.setElement(enemyElement);
        enemyElement.setAttribute('id', `e-${i + 1}`);

        const keyframes = `@keyframes moveEnemy${i} {
            0% {
              transform: translate(0, 0);
            }
            100% {
                filter: blur(2px);
              transform: translate(var(--translate-${i}-x), var(--translate-${i}-y));
            }
        }`;

        const styleElement = document.createElement('style');
        styleElement.innerHTML = keyframes;
        document.head.appendChild(styleElement);

        // Append the enemy element to the game board
        board.appendChild(enemyElement);

        enemies.push(enemy);
    }
}

//Function to move each enemies
export function moveEnemies() {
    for (let i = 0; i < numEnemies; i++) {
        const enemy = enemies[i];
        enemy.moveRandomly();
    }
}

export function affectEnemies(x, y) {
    let numberOfDeaths = 0;
    for (let i = 0; i < numEnemies; i++) {
        const enemy = enemies[i];
        if (enemy.x === x && enemy.y === y) {
            enemy.element.style.animation = "explode .25s ease-in-out forwards";
            enemies.splice(i, 1);
            numberOfDeaths++;
            numEnemies--;
            setTimeout(() => {
                enemy.element.remove();
            }, 250);
        }
    }
    return numberOfDeaths
}
