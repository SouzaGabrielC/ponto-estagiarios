class Estagiario {

    constructor(codigo, nome, setor, horarios) {
        this.codigo = codigo;
        this.nome = nome;
        this.horarios = horarios;
        this.setor = setor;
    }

    static getAllEstagiarios() {

        return new Promise((resolve, reject) => {

            $.ajax({
                url: '/relatorios/estagiarios',
                method: 'GET',
            }).done((data) => {

                if (data.err) {
                    reject(data.err);
                    return;
                }

                let estagiarios = [];
                for (let estagiario of data.estagiarios) {
                    estagiarios.push(new Estagiario(estagiario.codigo, estagiario.nome, estagiario.setor, estagiario.horarios));
                }

                resolve(estagiarios);

            });


        });

    }

    async getBatidas(dtInicial, dtFinal) {

        let {
            batidas,
            bancos
        } = await Batida.getBatidas(this.codigo, dtInicial, dtFinal);

        this.batidas = batidas;
        this.bancos = bancos;
        this.dtInicial = dtInicial;
        this.dtFinal = dtFinal;

        return {
            batidas: batidas,
            bancos: bancos
        }

    }

}