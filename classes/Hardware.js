var five = require("johnny-five");
let Menu = require('./Menu');
let Clock = require('./Clock');
let BatidaScreen = require('./BatidaScreen');

class Hardware {

    constructor(params) {

        this.lcd = params.lcd;
        this.ledOk = params.ledOk;
        this.ledError = params.ledError;
        this.btnOk = params.btnOk;
        this.btnUp = params.btnUp;
        this.btnDown = params.btnDown;

        this.lcd.useChar('clock');
        this.lcd.useChar('check');
        this.lcd.useChar('x');
        this.lcd.clear().home();


        this.menu = new Menu(this.lcd, this);
        this.clock = new Clock(this.lcd, this);
        this.batidaScreen = new BatidaScreen(this.lcd, this);

        this.btnOk.on('up', () => {

            if(this.menu.isActive)
                this.menu.select();
            else
                this.menu.show();

        });

        this.btnUp.on('up', () => {

            if(this.menu.isActive)
                this.menu.up();

        });

        this.btnDown.on('up', () => {

            if(this.menu.isActive)
                this.menu.down();

        });


        this.clock.show();

        this.ready = true;

    }

    loop() {

        let self = this;
    
        setInterval(()=>{
            if(self.ready){

                this.menu.update();
                this.clock.update();
                this.batidaScreen.update();
                
            }
        }, 500);
        
    }


    disable(){
        this.menu.hide();
        this.clock.hide();
        this.batidaScreen.hide();
    }


    batida(error, text){

        let self = this;

        this.batidaScreen.show(error, text);

        if(error)
            this.ledError.on();
        else
            this.ledOk.on();
        

        setTimeout(()=>{
        
            self.clock.show();
            self.ledError.off();
            self.ledOk.off();

        }, 2000);

    }

}

module.exports = Hardware;