class BancoHoras {

    constructor(id, codigo, data, credito, debito, valorAcumulado) {

        this.id = id;
        this.codigo = codigo;
        this.data = data;
        this._debito = debito;
        this._credito = credito;
        this._valorAcumulado = valorAcumulado;

    }

    get credito() {

        return Time.convertToTimeString(this._credito);

    }

    get debito() {

        return Time.convertToTimeString(this._debito);

    }

    get valorAcumulado() {

        return Time.convertToTimeString(this._valorAcumulado);

    }

    static alteraValue(codigo, data, horas, sum) {
        return new Promise((resolve, reject) => {

            if (/^\d{4}-\d{2}-\d{2}$/.test(data)) {

                if (!(/^\d{2}:\d{2}$/.test(horas))) {
                    reject('Horario no formato invalido');
                }

            } else {
                reject(`Data no formato invalido ${data}`);
            }

            $.ajax({
                url: '/relatorios/altera_banco',
                method: 'POST',
                data: {
                    codigo: codigo,
                    horas: horas,
                    data: data,
                    sum: sum
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
}