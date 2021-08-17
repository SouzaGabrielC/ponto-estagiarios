let EstagiarioSchema = require('../Schemas/Estagiario');

class EstagiarioHandler {

    constructor(conn) {

        this.conn = conn;
        this.Estagiario = conn.model('estagiarios', EstagiarioSchema);

    }

    findByCode(codigo) {

        let self = this;

        return new Promise((resolve, reject) => {

            self.Estagiario.findOne({
                codigo: codigo
            }, (err, estagiario) => {

                if (err) {
                    reject({
                        err: err,
                        msg: 'Erro de verificacao 0001'
                    });
                }


                resolve(estagiario);

            });


        });

    }

    deleteByCode(codigo){

        return new Promise((resolve, reject)=>{

            this.Estagiario.findOneAndRemove({
                codigo: codigo
              }, function (err) {

                if(err){
                    reject(err);
                    return;
                }

                resolve(true);

              });

        })

    }

}

module.exports = EstagiarioHandler;