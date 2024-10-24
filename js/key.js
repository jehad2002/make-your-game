export class KeyBoardHandler {
    constructor(callBackOnControlPress, callBackOnPause) {
        this.callBackOnControlPress = callBackOnControlPress;
        this.callBackOnPause = callBackOnPause;
        this.addEventListeners();
    }

    addEventListeners() {
        window.addEventListener("keydown", (e) => {
            if (e.key === "p" || e.key === "P") {
                this.callBackOnPause();
                return
            }

            this.callBackOnControlPress(e);
        });
    }
}
