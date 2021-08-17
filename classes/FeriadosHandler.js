let FeriadosSchema = require('../Schemas/Feriados');

class FeriadosHandler {

    constructor(conn) {
        this.conn = conn;
        this.Feriado = conn.model('feriados', FeriadosSchema);
    }

    isFeriado(data) {

        let self = this;

        return new Promise((resolve, reject) => {

            self.Feriado.find({
                dtInicial: {
                    $gte: data
                },
                dtFinal: {
                    $lte: data
                }
            }, (err, feriados) => {

                if (err) {
                    reject('Erro de verificacao.')
                }

                if (feriados != null && feriados != undefined && feriados.length >= 1) {

                    for (let feriado of feriados) {

                        let dataInicial = new Date(feriado.dtInicial);
                        let dataFinal = new Date(feriado.dtFinal);
                        
                        if (dataInicial.getUTCDate() == data.getUTCDate() && dataInicial.getUTCMonth() == data.getUTCMonth() && dataInicial.getUTCFullYear() == data.getUTCFullYear()) {
                            resolve(true);
                            break;
                        }

                        if (dataFinal.getUTCDate() == data.getUTCDate() && dataFinal.getUTCMonth() == data.getUTCMonth() && dataFinal.getUTCFullYear() == data.getUTCFullYear()) {
                            resolve(true);
                            break;
                        }

                        
                    }

                    resolve(false);

                } else
                    resolve(false);

            })

        });


    }

}

module.exports = FeriadosHandler;