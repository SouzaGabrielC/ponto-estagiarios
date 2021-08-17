class BatidaScreen {

    constructor(lcd, disable) {

        this.isActive = false;
        this.lcd = lcd;
        this.text = "";

        this.disable = disable;
    }

    update() {

        if (this.isActive) {

            this.render();

        }

    }

    render() {

        let col0 = 0;
        let col1 = 0;
        let hasSecondLine = false;
        let text = "";
        let splitedText = "";
        if(this.text.length <= 14){
            
            text = this.text;
            col0 = Math.ceil((16 - (text.length + 2)) / 2);
    
        }else if(this.text.length <= 32){

            col0 = 0; 
            hasSecondLine = true;

            text = this.text.slice(0, 14);
            splitedText = this.text.slice(14);

            col1 = Math.ceil((16 - splitedText.length) / 2);

        }

        if(this.error){
            this.lcd.clear();
            this.lcd.cursor(0,col0).print(':x: ' + text);
            if(hasSecondLine)
                this.lcd.cursor(1, col1).print(splitedText);
        }else{
            this.lcd.clear();
            this.lcd.cursor(0,3).print(':check: ' + this.text);
        }
        

    }

    show(error, text) {
        this.disable.disable();
        this.isActive = true;
        this.error = error;
        this.text = text;
    }

    hide() {
        this.isActive = false;
        this.text = "";
    }

}

module.exports = BatidaScreen;