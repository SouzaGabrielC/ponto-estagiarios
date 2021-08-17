class Menu{

    constructor(lcd, disable){
        this.disable = disable;
        this.isActive = false;
        this.lcd = lcd;
        this.items = {
            items: [
                {
                    nome: 'Mostrar IP'
                },
                {
                    nome: 'Teste'
                },
                {
                    nome: 'Sair do menu'
                }
            ],
            showing: [0, 1]
        }

    }

    update(){

        if(this.isActive){

            this.render();

        }

    }

    render() {

        this.lcd.clear();
        
    }

    show(){
        this.disable.disable();
        this.isActive = true;
    }

    hide(){
        this.isActive = false;
    }

    down(){

    }

    up(){

    }

    select(){
        
    }

}

module.exports = Menu;
