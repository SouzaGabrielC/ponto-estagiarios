class Clock {

    constructor(lcd, disable) {

        this.disable = disable;
        this.isActive = false;
        this.lcd = lcd;

    }

    update() {

        if (this.isActive) {

            this.render();

        }

    }

    render() {

        let date = new Date();
        this.lcd.clear();
        this.lcd.cursor(0, 3).print(":clock: " + ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2)).noBlink();
        this.lcd.cursor(1, 3).print(("0" + date.getDate()).slice(-2) + "/" + ("0" + (date.getMonth() + 1)).slice(-2) + "/" + date.getFullYear()).noBlink();

    }

    show() {
        this.disable.disable();
        this.isActive = true;
    }

    hide() {
        this.isActive = false;
    }

}

module.exports = Clock;