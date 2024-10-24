import { createGameBoard, gameBoard, board } from "./board.js";
import Bomb from "./bomb.js";
import { createEnemies, enemies, moveEnemies } from "./enemy.js";
import { HUDManager } from "./hud.js";
import { KeyBoardHandler } from "./key.js";
import { Player } from "./player.js";
import { PowerUp } from './powerup.js';
import { TimerManager } from "./timer.js";

const inGameAudio = document.getElementById('inGame');
inGameAudio.volume = 0.01;
const victorySound = document.getElementById("victorySound")
const playerDies = document.getElementById("playerDies")

const SPEED = 20;

class BomberManGame {
  constructor() {
    this.player = new Player();

    this.lastRenderTime = 0;
    this.gameOver = false;
    this.gamePause = false;

    this.addBomb = false;

    this.bombs = [];
    this.gameOverMessage = "";
    this.currentBombType = "simple"; // Initial bomb type
    this.bombAmount = 1; // Track the number of bombs he can place at time
    this.availableBombs = this.bombAmount;
  }

  run() {
    inGameAudio.play()
    this.modal = document.getElementById('menu');
    createGameBoard();
    createEnemies(gameBoard);
    gameBoard.appendChild(this.player.element);

    this.keyBoardHandler = new KeyBoardHandler(this.onControlPress.bind(this), this.onGamePause.bind(this));
    this.hUDManager = new HUDManager(this.bombAmount, this.currentBombType, this.onGamePause.bind(this));
    this.timerManager = new TimerManager(this.hUDManager);
    this.startGameLoop();
  }

  onGamePause() {
    if (this.gameOver) return;
    this.gamePause = !this.gamePause;
    this.timerManager.togglePauseResume(this.gamePause);
    this.hUDManager.togglePauseResume(this.gamePause);
  }

  onControlPress(e) {
    if (this.gamePause) return;

    // Handle player controls
    switch (e.key) {
      case "ArrowUp":
        if (this.player.inputDirection.x !== 0 || this.player.inputDirection.y !== 0) return;
        this.player.inputDirection = { x: 0, y: -1 };
        break;
      case "ArrowDown":
        if (this.player.inputDirection.x !== 0 || this.player.inputDirection.y !== 0) return;
        this.player.inputDirection = { x: 0, y: 1 };
        break;
      case "ArrowLeft":
        if (this.player.inputDirection.x !== 0 || this.player.inputDirection.y !== 0) return;
        this.player.inputDirection = { x: -1, y: 0 };
        break;
      case "ArrowRight":
        if (this.player.inputDirection.x !== 0 || this.player.inputDirection.y !== 0) return;
        this.player.inputDirection = { x: 1, y: 0 };
        break;
      case " ":
        this.addBomb = true;
        break;
    }
  }

  startGameLoop() {
    const gameLoop = (currentTime) => {
      if (this.gameOver) {
        inGameAudio.pause()
        clearInterval(this.timerManager.timerInterval);
        this.hUDManager.showGameOverMenu(this.gameOverMessage);
        return;
      }

      window.requestAnimationFrame(gameLoop);
      const secondsSinceLastRender = (currentTime - this.lastRenderTime) / 1000;
      if (secondsSinceLastRender < 1 / SPEED) return;

      this.lastRenderTime = currentTime;
      if (!this.gamePause) {
        this.update();
      }
    };

    window.requestAnimationFrame(gameLoop);
  }

  placeBomb() {
    this.addBomb = false;
    if (this.availableBombs > 0) {
      // Check if the player can place a bomb

      const bomb = new Bomb(this.player.position.x, this.player.position.y, this.getBombRadius());
      board[this.player.position.y - 1][this.player.position.x - 1] = "B";
      this.bombs.push(bomb);
      gameBoard.appendChild(bomb.element);
      this.availableBombs--;
      this.hUDManager.updateBombsCount(this.availableBombs);
      if (this.currentBombType === "manual") {
        bomb.manualBomb = true; // Set the bomb as manual
      } else {
        // Set a timer to explode the bomb after 3 seconds for non-manual bombs
        this.timerManager.addTimer(bomb.id, () => {
          this.removeBomb(bomb);
          this.hUDManager.updateScore(bomb.explode());
        }, 3000);
        this.timerManager.startTimer(bomb.id);
      }
    }
  }

  increaseBombCount() {
    this.availableBombs++;
    this.hUDManager.updateBombsCount(this.availableBombs);
    this.bombAmount++;
  }

  resetBombCount() {
    this.bombAmount = 1
    this.hUDManager.updateBombsCount(this.availableBombs);
  }

  getBombRadius() {
    switch (this.currentBombType) {
      case "simple":
        return 1;
      case "super":
        return 3;
      default:
        return 1;
    }
  }

  detonateBomb() {
    this.addBomb = false;
    for (const bomb of this.bombs) {
      if (bomb.manualBomb) {
        this.removeBomb(bomb);
        this.hUDManager.updateScore(bomb.explode());
        return true;
      }
    }
  }

  changeBombType(bombType) {
    this.hUDManager.updateBombType(bombType.toUpperCase());
    this.currentBombType = bombType;
  }

  removeBomb(bomb) {
    const index = this.bombs.indexOf(bomb);
    if (index !== -1) {
      this.bombs.splice(index, 1);
    }
    setTimeout(() => {
      board[bomb.y - 1][bomb.x - 1] = "V";
      gameBoard.removeChild(bomb.element);
      this.availableBombs = this.bombAmount;
      this.hUDManager.updateBombsCount(this.availableBombs);
    }, 255);
  }

  update() {
    if (this.addBomb) {
      if (!this.detonateBomb()) this.placeBomb();
    }
    this.player.update(this.gameOver);
    moveEnemies();
    this.checkPowerUpCollision();
    this.checkVictory();
    this.checkDeath();
  }

  checkDeath() {
    for (let i = 0; i < enemies.length; i++) {
      const enemy = enemies[i];
      if (enemy.x === this.player.position.x && enemy.y === this.player.position.y) {
        playerDies.play()
        this.hUDManager.decrementLives()
        const blinkInterval = setInterval(() => {
          if (this.player.element.style.visibility === "hidden") {
            this.player.element.style.visibility = "visible";
          } else {
            this.player.element.style.visibility = "hidden";
          }
        }, 200);

        // Arrêter le clignotement après 5 secondes (ou toute autre durée souhaitée)
        setTimeout(() => {
          clearInterval(blinkInterval);
          this.player.element.style.visibility = "visible"; // Assurez-vous que le joueur soit visible à la fin du clignotement
        }, 3000); // 5 secondes


        if (this.hUDManager.lives === 0) {
          playerDies.play()
          this.player.inputDirection = { x: 0, y: 0 };
          this.player.element.style.animation = "explode 1s ease-in-out forwards";
          this.gameOverMessage = `Killed by enemy\n`
          if (enemy.element.style.animationName === "none") {
            this.gameOver = true;
          } else {
            enemy.element.addEventListener('animationend', () => {
              this.gameOver = true;
            }, { once: true });
          }
        }
      }
    }
    if (this.hUDManager.timer === 0) {
      this.gameOver = true
      this.gameOverMessage = `Time Over\n`
    }
  }

  checkVictory() {
    if (enemies.length === 0) {
      this.gameOver = true;
      if (this.gameOver) {
        victorySound.play();
        this.gameOverMessage = `Victory\n`
      }
    }
  }

  checkPowerUpCollision() {
    const playerX = this.player.position.x;
    const playerY = this.player.position.y;
    if (board[playerY - 1][playerX - 1] === 'V' || board[playerY - 1][playerX - 1] === 'B') return;

    const powerUp = new PowerUp(board[playerY - 1][playerX - 1]);
    powerUp.applyEffect(this);
    board[playerY - 1][playerX - 1] = 'V';
    const cell = document.getElementById(`c-${playerY}-${playerX}`);
    if (cell) {
      const powerUp = document.getElementById("powerups")
      powerUp.play()
      cell.remove();
    }
  }
}

const game = new BomberManGame();
gameBoard.style.display = "grid";
game.run();

export function affectPlayer(x, y) {
  if (game.player.position.x === x && game.player.position.y === y) {
    game.gameOver = true;
    game.hUDManager.updateLives(0);
    game.player.inputDirection = { x: 0, y: 0 };
    game.gameOverMessage = `Killed by bomb\n`
    game.player.element.style.animation = "explode .25s ease-in-out forwards";
    playerDies.play()
    setTimeout(() => {
      game.player.element.remove();
    }, 305);
  }
}

export function affectBombs(x, y) {
  for (let i = 0; i < game.bombs.length; i++) {
    const bomb = game.bombs[i];
    if (bomb.x === x && bomb.y === y) {
      game.removeBomb(bomb);
      game.timerManager.cancelTimer(bomb.id);
      game.hUDManager.updateScore(bomb.explode());
    }
  }
}