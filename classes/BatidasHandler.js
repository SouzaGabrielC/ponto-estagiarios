let BatidasSchema = require('../Schemas/Batidas');

class BatidasHandler {

    constructor(conn) {

        this.conn = conn;
        this.Batida = conn.model('batidas', BatidasSchema);

    }

    isTheFirst(codigo) {

        let self = this;

        return new Promise((resolve, reject) => {

            let dataInicial = new Date();
            dataInicial.setHours(0);
            dataInicial.setMinutes(0);
            dataInicial.setSeconds(0);
            let dataAtual = new Date();

            self.Batida.find({
                codigo: codigo,
                data: {
                    $gt: dataInicial,
                    $lte: dataAtual
                }
            }, (err, batidas) => {

                if (err) {
                    reject({
                        err: err,
                        msg: 'Erro de verificacao 0010'
                    });
                }

                resolve(batidas == null || batidas == undefined || batidas.length == 0 ? true : false);

            });


        });

    }


    getBatidas(codigo, startDate, endDate) {

        let self = this;

        return new Promise((resolve, reject) => {

            self.Batida.find({
                codigo: codigo,
                data: {
                    $gte: startDate,
                    $lte: endDate
                }
            }, null,{
                sort: {
                    data: 1
                }
            }, (err, batidas) => {

                if (err) {
                    reject({
                        err: err,
                        msg: 'Erro de verificacao 0011'
                    });
                }

                resolve(batidas);

            });


        });

    }


    createBatida(codigo) {

        let self = this;

        return new Promise((resolve, reject) => {

            let batidaDate = new Date();

            let newBatida = new self.Batida({
                codigo: codigo,
                data: batidaDate,
                timezone: batidaDate.getTimezoneOffset()
            });

            newBatida.save((err) => {

                if (err) {
                    reject({
                        err: err,
                        msg: 'Erro de cadastro 0001'
                    });
                }

                resolve();

            });

        });

    }

    findLastDate(codigo) {

        let self = this;

        return new Promise((resolve, reject) => {

            self.Batida.findOne({
                codigo: codigo
            }, ['data'], {
                sort: {
                    data: -1
                }
            }, (err, batida) => {

                if (err) {
                    reject({
                        err: err,
                        msg: 'Erro de verificacao 0101'
                    });
                }

                resolve(batida != null && batida != undefined ? batida.data : null);

            });

        });

    }

    deleteByEstagiarioCode(codigo) {

        return new Promise((resolve, reject) => {

            this.Batida.remove({
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




module.exports = BatidasHandler;