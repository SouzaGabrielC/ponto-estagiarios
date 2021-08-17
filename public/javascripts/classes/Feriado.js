
class Feriado {
    
    constructor(nome, dtInicial, dtFinal){
        this.nome = nome;
        this.dtInicial = dtInicial;
        this.dtFinal = dtFinal;
    }

    static getFeriados(dtInicial, dtFinal){

        return new Promise((resolve, reject)=>{

            $.ajax({
                url: '/relatorios/feriados',
                method: 'POST', 
                data: {dtInicial: dtInicial, dtFinal: dtFinal},
                dataType: 'JSON'
            }).done((data)=>{

                if(data.err){
                    reject(err);
                    return;
                }

                let feriados = [];

                for(let feriado of data.feriados){
                    feriados.push(new Feriado(feriado.nome, feriado.dtInicial, feriado.dtFinal));
                }
                
                resolve(feriados);
                
            });

        });

    }

}