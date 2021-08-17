let BancoHorasSchema = require('../Schemas/BancoHora');
let FeriadosHandler = require('./FeriadosHandler');

class BancoHorasHandler {

    constructor(conn) {

        this.conn = conn;
        this.BancoHora = conn.model('banco_horas', BancoHorasSchema);
        this.diasSemana = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];

    }


    static itsTime(timeString) {

        if (/^\d{1,2}:\d{2}$/.test(timeString))
            return true;

        return false;

    }

    static diffBetweenTimes(timeString1, timeString2) {

        let splitTime1 = timeString1.split(':');
        let splitTime2 = timeString2.split(':');

        let hrsMilli1 = Number(splitTime1[0]) * 3.6e+6;
        let minMilli1 = Number(splitTime1[1]) * 60000;

        let hrsMilli2 = Number(splitTime2[0]) * 3.6e+6;
        let minMilli2 = Number(splitTime2[1]) * 60000;

        let millis1 = hrsMilli1 + minMilli1;
        let millis2 = hrsMilli2 + minMilli2;

        let millisDiff = millis2 - millis1;


        return millisDiff;

    }

    static convertToTimeString(millis) {

        let minutes = Math.ceil(millis / 60000);

        let hours = Math.floor(minutes / 60);
        minutes = minutes - (hours * 60);

        let string = ('0' + hours).slice(-2) + ':' + ('0' + minutes).slice(-2);

        return string;

    }

    createBancoHora(estagiario, data, batidas) {

        let self = this;

        let newBancoArgs = {
            codigo: estagiario.codigo,
            data: data,
            credito: 0,
            debito: 0,
            valorAcumulado: 0
        }

        return new Promise(async function (resolve, reject) {
            let bancoAnterior = await self._getLastBancoHora(estagiario.codigo);
            let valorAcumuladoAnterior = bancoAnterior == null || bancoAnterior == undefined ? 0 : bancoAnterior.valorAcumulado;

            newBancoArgs.valorAcumulado = valorAcumuladoAnterior;

            if (batidas != null) {

                if (batidas.length > 0 && batidas.length % 2 == 0) {

                    let millisTotal = 0;

                    for (let i = 0; i < batidas.length / 2; i++) {

                        millisTotal += batidas[(i * 2) + 1].data.getTime() - batidas[i * 2].data.getTime();

                    }

                    let horasTotalString = BancoHorasHandler.convertToTimeString(millisTotal);

                    let estagiarioHorasString = estagiario.horarios[self.diasSemana[batidas[0].data.getDay()] + 'Total'];

                    if (BancoHorasHandler.itsTime(estagiarioHorasString)) {

                        let diffTime = BancoHorasHandler.diffBetweenTimes(estagiarioHorasString, horasTotalString);

                        if (diffTime >= 0)
                            newBancoArgs.credito = diffTime;
                        else
                            newBancoArgs.debito = diffTime;

                        newBancoArgs.valorAcumulado += diffTime;

                        let newBanco = new self.BancoHora(newBancoArgs);

                        newBanco.save((err) => {

                            if (err) {
                                reject({
                                    err: err,
                                    msg: 'Erro de cadastro 0011'
                                });
                            }

                            resolve();

                        });


                    } else {

                        if (estagiarioHorasString == 'Folga') {
                            let newBanco = new self.BancoHora(newBancoArgs);
                            newBanco.save((err) => {

                                if (err) {
                                    reject({
                                        err: err,
                                        msg: 'Erro de cadastro 0100'
                                    });
                                }

                                resolve();

                            });
                        }

                        if (estagiarioHorasString == 'Extra') {

                            newBancoArgs.credito = BancoHorasHandler.diffBetweenTimes('00:00', estagiario.horarios[diaDaSemana + 'Total']);
                            newBancoArgs.valorAcumulado += newBancoArgs.credito;

                            let newBanco = new self.BancoHora(newBancoArgs);

                            newBanco.save((err) => {

                                if (err) {
                                    reject({
                                        err: err,
                                        msg: 'Erro de cadastro 0100'
                                    });
                                }

                                resolve();

                            });
                        }

                    }


                } else {

                    let newBanco = new self.BancoHora(newBancoArgs);

                    newBanco.save((err) => {

                        if (err) {
                            reject({
                                err: err,
                                msg: 'Erro de de cadastro 0010'
                            });
                        }

                        resolve();

                    });

                }

            } else {

                let diaDaSemana = self.diasSemana[data.getDay()];

                let feriadoObject =  new FeriadosHandler(self.conn);
                
                let isFeriado = await feriadoObject.isFeriado(data);

                if (estagiario.horarios[diaDaSemana + 'Folga'] || estagiario.horarios[diaDaSemana + 'Extra'] || isFeriado) {

                    let newBanco = new self.BancoHora(newBancoArgs);

                    newBanco.save((err) => {

                        if (err) {
                            reject({
                                err: err,
                                msg: 'Erro de de cadastro 0010'
                            });
                        }

                        resolve();

                    });

                } else {

                    newBancoArgs.debito = BancoHorasHandler.diffBetweenTimes(estagiario.horarios[diaDaSemana + 'Total'], '00:00');

                    newBancoArgs.valorAcumulado += newBancoArgs.debito;

                    let newBanco = new self.BancoHora(newBancoArgs);

                    newBanco.save((err) => {

                        if (err) {
                            reject({
                                err: err,
                                msg: 'Erro de de cadastro 0010'
                            });
                        }

                        resolve();

                    });

                }

            }


        });

    }

    _getLastBancoHora(codigo) {

        let self = this;

        return new Promise((resolve, reject) => {

            self.BancoHora.findOne({
                codigo: codigo
            }, [], {
                sort: {
                    data: -1
                }
            }, (err, banco) => {

                if (err) {
                    reject({
                        err: err,
                        msg: 'Erro de verificacao 0110'
                    });
                }

                resolve(banco);

            });


        });

    }


    _findBancoHora(codigo, data) {

        let self = this;

        return new Promise((resolve, reject) => {

            self.BancoHora.findOne({
                    codigo: codigo,
                    data: data
                },
                (err, banco) => {

                    if (err) {
                        reject({
                            err: err,
                            msg: 'Erro de verificacao 1111'
                        });
                    }

                    resolve(banco);

                });


        });

    }


    atualizarBanco(params) {

        let estagiario = params.estagiario;
        let data = params.data;
        let batidas = params.batidas;
        let self = this;

        return new Promise((resolve, reject) => {

            self.BancoHora.findOne({
                codigo: estagiario.codigo,
                data: data
            }, async(err, banco) => {

                if (err) {
                    reject(err);
                    return;
                }

                if (banco == null || banco == undefined) {
                    banco = new self.BancoHora({
                        codigo: estagiario.codigo,
                        credito: 0,
                        debito: 0,
                        valorAcumulado: 0,
                        data: data
                    });
                }

                let dataAnterior = new Date(data.getTime());

                dataAnterior.setUTCDate(dataAnterior.getUTCDate() - 1);

                let bancoAnterior = await self._findBancoHora(estagiario.codigo, dataAnterior);

                if (batidas.length > 0 && batidas.length % 2 == 0) {

                    let millisTotal = 0;

                    for (let i = 0; i < batidas.length / 2; i++) {

                        millisTotal += batidas[(i * 2) + 1].data.getTime() - batidas[i * 2].data.getTime();

                    }


                    let horasTotalString = BancoHorasHandler.convertToTimeString(millisTotal);

                    let estagiarioHorasString = estagiario.horarios[self.diasSemana[batidas[0].data.getDay()] + 'Total'];

                    if (BancoHorasHandler.itsTime(estagiarioHorasString)) {

                        let diffTime = BancoHorasHandler.diffBetweenTimes(estagiarioHorasString, horasTotalString);

                        banco.credito = 0;
                        banco.debito = 0;

                        if (diffTime >= 0)
                            banco.credito = diffTime;
                        else
                            banco.debito = diffTime;

                        banco.valorAcumulado = bancoAnterior ? bancoAnterior.valorAcumulado + diffTime : diffTime;

                        banco.save((err) => {
                            if (err) {
                                reject(err);
                                return;
                            }

                            resolve(true);

                        });

                    } else {

                        if (estagiarioHorasString == 'Folga') {
                            banco.valorAcumulado = bancoAnterior ? bancoAnterior.valorAcumulado : 0;

                            banco.save((err) => {
                                if (err) {
                                    reject(err);
                                    return;
                                }

                                resolve(true);

                            });
                        }

                        if (estagiarioHorasString == 'Extra') {

                            banco.credito = BancoHorasHandler.diffBetweenTimes('00:00', horasTotalString);


                            banco.valorAcumulado = bancoAnterior ? bancoAnterior.valorAcumulado + banco.credito : banco.credito;

                            banco.save((err) => {
                                if (err) {
                                    reject(err);
                                    return;
                                }

                                resolve(true);

                            });
                        }

                    }

                } else if (batidas.length == 0) {
                    console.log('batidas = 0');
                    let estagiarioHorasString = estagiario.horarios[self.diasSemana[data.getUTCDay()] + 'Total'];
                    
                    let feriadoObject =  new FeriadosHandler(self.conn);
                    
                    let isFeriado = await feriadoObject.isFeriado(data);

                    if (BancoHorasHandler.itsTime(estagiarioHorasString) && !isFeriado) {

                        let diffTime = BancoHorasHandler.diffBetweenTimes(estagiarioHorasString, '00:00');

                        banco.credito = 0;
                        banco.debito = 0;

                        banco.debito = diffTime;

                        banco.valorAcumulado = bancoAnterior ? bancoAnterior.valorAcumulado + diffTime : diffTime;

                        banco.save((err) => {
                            if (err) {
                                reject(err);
                                return;
                            }

                            resolve(true);

                        });

                    } else {
                        console.log('n é feriado');
                        if (estagiarioHorasString == 'Folga' || estagiarioHorasString == 'Extra' || estagiarioHorasString == undefined || isFeriado) {
                            console.log('folga, extra, sei la');
                            banco.valorAcumulado = bancoAnterior ? bancoAnterior.valorAcumulado : 0;

                            banco.save((err) => {
                                if (err) {
                                    reject(err);
                                    return;
                                }

                                resolve(true);

                            });
                        }

                    }


                } else {

                    banco.valorAcumulado = bancoAnterior ? bancoAnterior.valorAcumulado : 0;

                    banco.save((err) => {
                        if (err) {
                            reject(err);
                            return;
                        }

                        resolve(true);

                    });
                }

            });

        });

    }

    deleteByEstagiarioCode(codigo) {

        return new Promise((resolve, reject) => {

            this.BancoHora.remove({
                codigo: codigo
            }, function (error) {

                if (error) {
                    reject(error);
                    return;
                }

                resolve(true);

            });

        });

    }

}

module.exports = BancoHorasHandler;