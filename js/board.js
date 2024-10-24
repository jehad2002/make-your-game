export const gameBoard = document.getElementById('game-board')
const GRID_SIZE = 16

// Define the game board as a 2D array
export const board = [
    // 'V' for void cell, 'B' for indestructible block, 'W' for destructible wall
    ['B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B'],
    ['B', 'V', 'W', 'W', 'W', 'W', 'W', 'W', 'B', 'W', 'W', 'V', 'V', 'V', 'V', 'B'],
    ['B', 'V', 'B', 'W', 'B', 'W', 'B', 'V', 'W', 'W', 'B', 'W', 'B', 'V', 'V', 'B'],
    ['B', 'V', 'V', 'V', 'W', 'V', 'V', 'V', 'B', 'V', 'V', 'V', 'V', 'V', 'V', 'B'],
    ['B', 'V', 'B', 'W', 'B', 'W', 'B', 'V', 'V', 'V', 'B', 'W', 'B', 'V', 'W', 'B'],
    ['B', 'W', 'W', 'W', 'W', 'B', 'V', 'W', 'B', 'W', 'W', 'W', 'W', 'V', 'W', 'B'],
    ['B', 'W', 'B', 'W', 'B', 'V', 'V', 'V', 'V', 'W', 'B', 'W', 'B', 'V', 'W', 'B'],
    ['B', 'W', 'W', 'W', 'V', 'V', 'B', 'V', 'V', 'V', 'W', 'V', 'V', 'V', 'W', 'B'],
    ['B', 'W', 'B', 'W', 'B', 'V', 'W', 'V', 'B', 'W', 'B', 'V', 'B', 'W', 'W', 'B'],
    ['B', 'V', 'V', 'V', 'V', 'V', 'B', 'W', 'W', 'V', 'V', 'V', 'W', 'W', 'W', 'B'],
    ['B', 'V', 'V', 'W', 'V', 'B', 'W', 'W', 'W', 'W', 'V', 'B', 'W', 'W', 'V', 'B'],
    ['B', 'V', 'W', 'W', 'W', 'V', 'B', 'V', 'W', 'V', 'V', 'V', 'B', 'V', 'V', 'B'],
    ['B', 'V', 'B', 'W', 'B', 'V', 'V', 'V', 'B', 'V', 'W', 'V', 'W', 'V', 'W', 'B'],
    ['B', 'V', 'W', 'W', 'W', 'V', 'B', 'V', 'V', 'V', 'W', 'V', 'V', 'V', 'W', 'B'],
    ['B', 'V', 'V', 'V', 'V', 'V', 'V', 'W', 'V', 'V', 'V', 'W', 'W', 'V', 'V', 'B'],
    ['B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B'],
];


export function randomGridPosition() {
    return {
        x: Math.floor(Math.random() * GRID_SIZE) + 1,
        y: Math.floor(Math.random() * GRID_SIZE) + 1
    }
}

export function outsideGrid(position) {
    return (
        position.x < 1 || position.x > GRID_SIZE ||
        position.y < 1 || position.y > GRID_SIZE
    )
}

export function isValidMove(x, y) {
    const cellValue = board[y][x];
    return cellValue === 'V' || (isWall(x, y) && !document.getElementById(`c-${y + 1}-${x + 1}`).classList.contains("wall"));
}

export function isWall(x, y) {
    if (outsideGrid({ x, y })) {
        return false
    }
    const cellValue = board[y][x];
    return cellValue === 'W' || cellValue === 'S' || cellValue === 'M' || cellValue === 'X';
}

export function createGameBoard() {
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            if (board[i][j] === 'V') continue;

            const cell = document.createElement('div');
            let cellClass = '';
            if (board[i][j] === 'B') {
                cellClass = 'block';
            } else {
                cellClass = 'wall';
                if (Math.random() < 0.4) {
                    const powerUpTypes = ['X', 'S', 'M'];
                    const randomPowerUp = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
                    board[i][j] = randomPowerUp;
                }
            }

            cell.classList.add(cellClass);
            cell.setAttribute('id', `c-${i + 1}-${j + 1}`);
            cell.style.gridRowStart = i + 1;
            cell.style.gridColumnStart = j + 1;

            fragment.appendChild(cell);
        }
    }

    gameBoard.appendChild(fragment);
}

export function destroyWall(x, y) {
    if (isWall(x, y)) {
        // Destroy the wall by replacing it with a void cell
        const cell = document.getElementById(`c-${y + 1}-${x + 1}`);
        cell.classList.add("explode");
        setTimeout(() => {
            if (board[y][x] === "W") {
                board[y][x] = 'V';
                cell.remove();
            } else {
                cell.classList.remove("explode");
                cell.classList.remove("wall");
                cell.classList.add("power");
                cell.innerHTML = board[y][x];
            }
        }, 250);
        return 1;
    } else if (board[y][x] == 'B') {
        return 0;
    } else {
        return 2;
    }
}
