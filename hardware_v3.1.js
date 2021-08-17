let KeyboardLines = require('node-hid-stream').KeyboardLines;
let leitor = new KeyboardLines({
    vendorId: 3690,
    productId: 773
});
let Raspi = require('raspi-io');
let five = require('johnny-five');
let Hardware = require('./classes/Hardware');
let board;

// DATABASE
let mongoose = require("mongoose");
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://127.0.0.1/ponto', {
    useMongoClient: true
});

// UTILS
let EstagiarioHandler = require('./classes/EstagiarioHandler');
let BatidasHandler = require('./classes/BatidasHandler');
let BancoHorasHandler = require('./classes/BancoHorasHandler');

// Set the board
board = new five.Board({
    io: new Raspi(),
    repl: false
});

// Create hardware components variables
let isBoardReady = false;
let lcd, ledOk, ledError, buttonUp, buttonDown, buttonOk;
let hardware;

// Board ready to work
board.on('ready', function () {

    isBoardReady = true;

    let pinLedOk = 'P1-22',
        pinLedError = 'P1-18',
        pinButtonUp = 'P1-11',
        pinButtonDown = 'P1-13',
        pinButtonOk = 'P1-15';

    ledOk = new five.Led({
        pin: pinLedOk
    });

    ledError = new five.Led({
        pin: pinLedError
    });

    buttonUp = new five.Button({
        pin: pinButtonUp
    });

    buttonDown = new five.Button({
        pin: pinButtonDown
    });

    buttonOk = new five.Button({
        pin: pinButtonOk
    });

    lcd = new five.LCD({
        // LCD pin name  RS  EN  DB4 DB5 DB6 DB7
        // Arduino pin # 12  11   5   4   3   2
        pins: ['P1-40', 'P1-38', 'P1-35', 'P1-33', 'P1-31', 'P1-29'],
        //pins: ['12', '11', '5', '4', '3', '2'],
        backlight: 13,
        rows: 2,
        cols: 16

    });

    hardware = new Hardware({
        lcd: lcd,
        ledOk: ledOk,
        ledError: ledError,
        btnOk: buttonOk,
        btnDown: buttonDown,
        btnUp: buttonUp
    });

    hardware.loop();

});


// Scanner read barcode data
leitor.on("data", async function (data) {

    let estagiarioHandler = new EstagiarioHandler(mongoose.connection);
    let batidasHandler = new BatidasHandler(mongoose.connection);
    let bancoHandler = new BancoHorasHandler(mongoose.connection);

    try {

        let estagiario = await estagiarioHandler.findByCode(data);

        if (estagiario != null && estagiario != undefined) {

            let isFirstBatida = await batidasHandler.isTheFirst(data);

            if (isFirstBatida) {


                let dataUltimaBatida = await batidasHandler.findLastDate(data);

                if (dataUltimaBatida != null) {

                    let batidaData = new Date(dataUltimaBatida);
                    let batidaEndData = new Date(dataUltimaBatida);

                    batidaData.setUTCHours(0);
                    batidaData.setUTCMinutes(0);
                    batidaData.setUTCSeconds(0);
                    batidaData.setUTCMilliseconds(0);

                    batidaEndData.setUTCHours(23);
                    batidaEndData.setUTCMinutes(59);
                    batidaEndData.setUTCSeconds(0);
                    batidaEndData.setUTCMilliseconds(0);

                    let bancoUpdateNext = false;

                    do {

                        console.log(batidaData, batidaEndData);

                        let bancoUpdated = false;

                        try {
                            
                            let batidas = await batidasHandler.getBatidas(data, batidaData, batidaEndData);

                            console.log('Batidas: ', batidas);

                            bancoUpdated = await bancoHandler.atualizarBanco({
                                estagiario,
                                data: batidaData,
                                batidas
                            });

                            console.log(`Banco update? ${bancoUpdated}`);

                        } catch (error) {
                            console.error(error);
                        }
                        
        
                        batidaData.setUTCDate(batidaData.getUTCDate() + 1);
                        batidaEndData.setUTCDate(batidaEndData.getUTCDate() + 1);

                       
                        if (bancoUpdated) {

                            
                            let lastDateBatida = new Date();

                            if (lastDateBatida.getUTCFullYear() >= batidaData.getUTCFullYear()) {

                                if (lastDateBatida.getUTCMonth() > batidaData.getUTCMonth()) {

                                    bancoUpdateNext = true;

                                } else if (lastDateBatida.getUTCMonth() == batidaData.getUTCMonth() && lastDateBatida.getUTCDate() >= batidaData.getUTCDate()) {

                                    bancoUpdateNext = true;

                                } else {
                                    bancoUpdateNext = false;
                                }

                            } else {
                                bancoUpdateNext = false;
                            }

                        } else {
                            bancoUpdateNext = false;
                        }

                        console.log('next update: ', bancoUpdateNext);

                    } while (bancoUpdateNext);



                }

            }

            let dataInicial = new Date();
            dataInicial.setUTCHours(0);
            dataInicial.setUTCMinutes(0);
            dataInicial.setUTCSeconds(0);
            dataInicial.setUTCMilliseconds(0);
            let dataAtual = new Date();

            let batidas = await batidasHandler.getBatidas(data, dataInicial, dataAtual);

            if (!batidas || batidas.length < estagiario.horarios.segunda.length) {

                batidasHandler.createBatida(data).then(() => {

                        if (batidas.length % 2 == 0) {
                            hardware.batida(false, 'Entrada ' + (Math.floor(batidas.length / 2) + 1));
                        } else {
                            hardware.batida(false, 'Saida ' + (Math.floor(batidas.length / 2) + 1));
                        }

                    })
                    .catch((err) => {

                        hardware.batida(true, 'Erro nao foi possivel gravar!');

                    })

            } else {

                hardware.batida(true, 'Numero de batidas excedido!');

            }



        } else {

            hardware.batida(true, 'Estagiario nao encontrado!');

        }

    } catch (ex) {

        console.log(ex);
        hardware.batida(true, ex.msg);

    }

});