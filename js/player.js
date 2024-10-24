import { isValidMove } from "./board.js";

export class Player {
  constructor() {
    this.element = document.createElement("div");
    this.position = { x: 2, y: 2 };
    this.element.style.gridRowStart = this.position.y;
    this.element.style.gridColumnStart = this.position.x;
    this.element.classList.add("player");
    this.inputDirection = { x: 0, y: 0 };
  }

  update(gameOver) {
    if ((this.inputDirection.x === 0 && this.inputDirection.y === 0) || gameOver) return;

    const newPositionX = this.position.x + this.inputDirection.x;
    const newPositionY = this.position.y + this.inputDirection.y;

    if (isValidMove(newPositionX - 1, newPositionY - 1)) {
      this.element.style.setProperty('--translate-x', `${this.element.clientWidth * this.inputDirection.x}px`);
      this.element.style.setProperty('--translate-y', `${this.element.clientHeight * this.inputDirection.y}px`);

      this.element.style.animationName = "movePlayer";
      this.element.style.animationFillMode = "forwards";
      this.element.style.animationDuration = "0.125s";

      this.element.addEventListener('animationend', () => {
        this.position.x = newPositionX;
        this.position.y = newPositionY;
        this.element.style.gridRowStart = this.position.y;
        this.element.style.gridColumnStart = this.position.x;
        this.element.style.animationName = "none";
        this.inputDirection = { x: 0, y: 0 };
      }, { once: true });
    } else {
      this.inputDirection = { x: 0, y: 0 };
    }
  }
}

