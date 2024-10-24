const pauseSound = document.getElementById("pauseSound")
const inGameAudio = document.getElementById('inGame');

export class HUDManager {
    constructor(bombsCount, currentBombType, callBackOnPause) {
        this.score = 0;
        this.lives = 3;
        this.bombType = currentBombType.toUpperCase();
        this.bombsCount = bombsCount;
        this.timer = 300; // 5 minutes in seconds
        this.canDecrementLives = true;
        this.callBackOnPause = callBackOnPause;

        this.pauseMenuModal = document.getElementById('pause-menu');
        this.gameOverMenuModal = document.getElementById('game-over-menu');
        this.hudContainer = document.createElement('div');
        this.hudContainer.className = 'hud';
        document.body.appendChild(this.hudContainer);

        this.createHUDElements();

        const resumeButton = this.pauseMenuModal.querySelector('button#resume');
        const restartButton = this.pauseMenuModal.querySelector('button#restart');

        restartButton.addEventListener('click', () => {
            window.location.reload(); // Reload the page to restart the game.
        });

        resumeButton.addEventListener('click', () => {
            this.pauseMenuModal.close();
            this.callBackOnPause(); // You can call your onGamePause callback to resume the game.
        });
    }

    createHUDElements() {
        const elements = [
            { name: 'Score', property: 'score', value: this.score },
            { name: 'Lives', property: 'lives', value: this.lives },
            { name: 'Bomb Type', property: 'bombType', value: this.bombType },
            { name: 'Bombs', property: 'bombsCount', value: this.bombsCount },
            { name: 'Timer', property: 'timer', value: this.formatTime(this.timer) }
        ];

        elements.forEach(item => {
            const element = this.createHUDElement(`${item.name}: ${item.value}`);
            this[item.property + 'Element'] = element;
            this.hudContainer.appendChild(element);
        });
    }
    
    createHUDElement(text) {
        const element = document.createElement('div');
        element.className = 'hud-element';
        element.innerText = text;
        return element;
    }

    updateScore(score) {
        this.score += score;
        this.scoreElement.innerText = `Score: ${this.score}`;
    }

    updateLives(lives) {
        this.lives = lives;
        this.livesElement.innerText = `Lives: ${lives}`;
    }

    updateBombType(bombType) {
        this.bombType = bombType;
        this.bombTypeElement.innerText = `Bomb Type: ${bombType}`;
    }

    updateBombsCount(count) {
        this.bombsCount = count;
        this.bombsCountElement.innerText = `Bombs: ${count}`;
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    decrementTimer() {
        this.timer--;
        this.timerElement.innerText = `Timer: ${this.formatTime(this.timer)}s`;
    }

    decrementLives() {
        if (this.lives > 0 && this.canDecrementLives) {
            this.lives -= 1;
            this.livesElement.innerText = `Lives: ${this.lives}`;
            this.canDecrementLives = false
        }
        // Ajoutez un délai de 3 secondes avant de permettre la prochaine décrémentation
        setTimeout(() => {
            this.canDecrementLives = true;
        }, 3000);
    }

    showPauseMenu() {
        inGameAudio.pause()
        pauseSound.play()
        this.pauseMenuModal.showModal();
    }

    hidePauseMenu() {
        inGameAudio.play()
        if (this.pauseMenuModal) this.pauseMenuModal.close();
    }

    showGameOverMenu(message) {
        const bonusTimer = Math.round((3000 - this.timer) / 10);
        this.updateScore(bonusTimer);
        this.gameOverMenuModal.querySelector(".message").innerText = message + `Your score: ${this.score}\n`;
        const restartButton = this.gameOverMenuModal.querySelector('button');

        restartButton.addEventListener('click', () => {
            window.location.reload(); // Reload the page to restart the game.
        });
        setTimeout(() => {
            this.gameOverMenuModal.showModal();
        }, 750)
    }

    togglePauseResume(gamePause) {
        if (gamePause) {
            this.showPauseMenu();
        } else {
            this.hidePauseMenu();
        }
    }
}
