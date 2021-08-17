class Batida {

    constructor(id, codigo, data, manual, timezone) {

        this.id = id;
        this.codigo = codigo;
        this.data = data;
        this.manual = manual;
        this.timezone = timezone;

    }

    static getBatidas(codigo, dtInicial, dtFinal) {

        return new Promise((resolve, reject) => {

            let batidas = [];
            let bancoH = [];

            $.ajax({
                url: '/relatorios/batidas',
                method: 'POST',
                data: {
                    codigo: codigo,
                    dtInicial: dtInicial,
                    dtFinal: dtFinal
                },
                dataType: 'JSON'
            }).done((data) => {

                if (data.err) {
                    reject(data.err);
                    return;
                }

                for (let batida of data.batidas) {

                    batidas.push(new Batida(batida._id, batida.codigo, batida.data, batida.manual, batida.timezone));

                }

                for (let banco of data.banco) {

                    bancoH.push(new BancoHoras(banco._id, banco.codigo, banco.data, banco.credito, banco.debito, banco.valorAcumulado));

                }

                resolve({
                    batidas: batidas,
                    bancos: bancoH
                });

            });

        });

    }

    static batidaManual(codigo, data, horario) {

        let dataString = ``;

        return new Promise((resolve, reject) => {

            if (/^\d{4}-\d{2}-\d{2}$/.test(data)) {

                if (/^\d{2}:\d{2}$/.test(horario)) {
                    dataString = `${data}T${horario}:00`;
                } else {
                    reject('Horario no formato invalido');
                }

            } else {
                reject(`Data no formato invalido ${data}`);
            }

            $.ajax({
                url: '/relatorios/batida_manual',
                method: 'POST',
                data: {
                    codigo: codigo,
                    dataString: dataString
                },
                dataType: 'JSON'
            }).done((data) => {

                if (data.err) {
                    reject(err);
                    return;
                }

                resolve(true);
            });

        });

    }

    get date_object() {

        let dataObject = new Date(this.data);
        dataObject.setTime(dataObject.getTime() + ((dataObject.getTimezoneOffset() - this.timezone) * 60000));

        return dataObject;

    }

}