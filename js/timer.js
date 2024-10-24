export class TimerManager {
    constructor(hud) {
        this.hud = hud
        this.timers = new Map(); // Use a Map to store timers
        this.timerInterval = setInterval(() => {
            this.hud.decrementTimer();
        }, 1000);
    }

    // Add a timer to the manager
    addTimer(id, callback, duration) {
        const timer = {
            id,
            callback,
            duration,
            remainingTime: duration,
            isPaused: false,
            timerId: null,
        };

        this.timers.set(id, timer);
    }

    // Start a timer
    startTimer(id) {
        const timer = this.timers.get(id);

        if (timer && !timer.isPaused) {
            timer.startTime = Date.now();
            timer.timerId = setTimeout(() => {
                this.onTimerComplete(id);
            }, timer.remainingTime);
        }
    }

    // Pause a timer
    pauseTimer(timer) {
        if (timer && !timer.isPaused) {
            clearTimeout(timer.timerId);
            timer.remainingTime -= Date.now() - timer.startTime;
            timer.isPaused = true;
        }
    }

    // Resume a paused timer
    resumeTimer(timer) {
        if (timer && timer.isPaused) {
            timer.startTime = Date.now();
            timer.timerId = setTimeout(() => {
                this.onTimerComplete(timer.id);
            }, timer.remainingTime);
            timer.isPaused = false;
        }
    }

    // Cancel and remove a timer
    cancelTimer(id) {
        const timer = this.timers.get(id);

        if (timer) {
            clearTimeout(timer.timerId);
            this.timers.delete(id);
        }
    }

    // Callback function when a timer completes
    onTimerComplete(id) {
        const timer = this.timers.get(id);

        if (timer) {
            timer.callback();
            this.timers.delete(id);
        }
    }

    // When the game is paused:
    pauseTimers() {
        this.timers.forEach((timer) => {
            if (!timer.isPaused) {
                this.pauseTimer(timer);
            }
        });
        clearInterval(this.timerInterval);
    }

    // When the game is resumed:
    resumeTimers() {
        this.timers.forEach((timer) => {
            if (timer.isPaused) {
                this.resumeTimer(timer);
            }
        });
        this.timerInterval = setInterval(() => {
            this.hud.decrementTimer();
        }, 1000);
    }

    //toggle pause/resume
    togglePauseResume(gamePause) {
        if (gamePause) {
            this.pauseTimers();
        } else {
            this.resumeTimers();
        }
    }
}
