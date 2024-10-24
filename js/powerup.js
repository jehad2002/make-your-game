export class PowerUp {
    constructor(type) {
        this.type = type;
        this.duration = 15 * 1000; // in seconds
    }

    applyEffect(game) {
        if (this.type === 'X') {
            game.increaseBombCount();
            game.timerManager.cancelTimer(this.type);
            game.timerManager.addTimer(this.type, () => {
                game.resetBombCount();
            }, this.duration);
            game.timerManager.startTimer(this.type);
        } else if (this.type === 'S') {
            game.changeBombType('super');
            game.timerManager.cancelTimer(this.type);
            game.timerManager.cancelTimer("M");
            game.timerManager.addTimer(this.type, () => {
                game.changeBombType('simple');
            }, this.duration);
            game.timerManager.startTimer(this.type);
        } else if (this.type === 'M') {
            game.changeBombType('manual');
            game.timerManager.cancelTimer(this.type);
            game.timerManager.cancelTimer("S");
            game.timerManager.addTimer(this.type, () => {
                game.changeBombType('simple');
            }, this.duration);
            game.timerManager.startTimer(this.type);
        }
    }
}
