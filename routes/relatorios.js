var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Estagiarios = require('../Schemas/Estagiario');
var Batidas = require('../Schemas/Batidas');
var BancoHoras = require('../Schemas/BancoHora');
var Feriados = require('../Schemas/Feriados');
var Empresas = require('../Schemas/Empresa');

var BancoHandler = require('../classes/BancoHorasHandler');
var BatidaHandler = require('../classes/BatidasHandler');
var EstagiarioHandler = require('../classes/EstagiarioHandler');

/* GET relatorios page. */
router.get('/', function (req, res, next) {
  res.render('relatorios');
});

router.get('/estagiarios', function (req, res, next) {

  var conn = mongoose.createConnection('mongodb://127.0.0.1/ponto');

  var Estagiario = conn.model('estagiarios', Estagiarios);

  Estagiario.find({}, function (err, estagiarios) {
    conn.close();
    if (err) {
      res.json({
        err: true
      });
      return;
    }

    res.json({
      err: false,
      estagiarios: estagiarios
    });

  });

});

router.post('/batidas', function (req, res, next) {

  let dtInicial = req.body.dtInicial;
  let dtFinal = req.body.dtFinal;
  let codigo = req.body.codigo;

  var conn = mongoose.createConnection('mongodb://127.0.0.1/ponto');

  var Batida = conn.model('batidas', Batidas);
  var BancoHora = conn.model('banco_horas', BancoHoras);

  let DateInicial = new Date(dtInicial);
  let DateFinal = new Date(dtFinal);

  DateFinal.setTime((DateFinal.getTime() + 8.64e+7));

  Batida.find({
    codigo: codigo,
    data: {
      $gte: DateInicial,
      $lte: DateFinal
    }
  }, ['data', 'codigo', 'manual', 'timezone'], {
    sort: {
      data: 1
    }
  }, function (err, batidas) {

    if (err) {
      conn.close();
      console.log(err);
      res.json({
        err: true
      });
      return;
    }

    BancoHora.find({
      codigo: codigo,
      data: {
        $gte: DateInicial,
        $lte: DateFinal
      }
    }, function (err, banco) {


      if (err) {
        conn.close();
        console.log(err);
        res.json({
          err: true
        });
        return;
      }


      conn.close();
      res.json({
        err: false,
        batidas: batidas,
        banco: banco
      });

    });

  });



});

router.post('/feriados', (req, res, next) => {

  let dtInicial = req.body.dtInicial;
  let dtFinal = req.body.dtFinal;

  let conn = mongoose.createConnection('mongodb://127.0.0.1/ponto');

  let Feriado = conn.model('feriados', Feriados);

  let DateInicial = new Date(dtInicial);
  let DateFinal = new Date(dtFinal);

  Feriado.find({
    $or: [{
        dtInicial: {
          $gte: DateInicial,
          $lte: DateFinal
        }
      },
      {
        dtFinal: {
          $gte: DateInicial,
          $lte: DateFinal
        }
      }
    ]
  }, (err, feriados) => {

    if (err) {
      res.json({
        err: true
      });
      conn.close();
      return;
    }

    res.json({
      err: false,
      feriados: feriados
    });
    conn.close();

  });

});

router.post('/batida_manual', (req, res, next) => {

  let dataString = req.body.dataString;
  let codigo = req.body.codigo;

  let conn = mongoose.createConnection('mongodb://127.0.0.1/ponto');

  let Batida = conn.model('batidas', Batidas);
  let BancoHora = conn.model('banco_horas', BancoHoras);

  console.log(dataString);

  let batidaData = new Date(dataString);

  console.log(batidaData);

  let batida = new Batida({
    codigo: codigo,
    data: batidaData,
    timezone: batidaData.getTimezoneOffset(),
    manual: true
  });

  batida.save(async(err) => {

    try {

      let batidasHandler = new BatidaHandler(conn);
      let bancoHandler = new BancoHandler(conn);
      let estagiariosHandler = new EstagiarioHandler(conn);

      batidaData.setUTCHours(0);
      batidaData.setUTCMinutes(0);
      batidaData.setUTCSeconds(0);
      batidaData.setUTCMilliseconds(0);

      let batidaEndData = new Date(batidaData.getTime());

      batidaEndData.setUTCHours(23);
      batidaEndData.setUTCMinutes(59);

      let estagiario = await estagiariosHandler.findByCode(codigo);

      let bancoUpdateNext = false;

      do {

        let bancoUpdated = false;

        try{

          let batidas = await batidasHandler.getBatidas(codigo, batidaData, batidaEndData);

          bancoUpdated = await bancoHandler.atualizarBanco({
            estagiario,
            data: batidaData,
            batidas
          });

        }catch(ex){
          console.log(ex);
        }

        batidaData.setUTCDate(batidaData.getUTCDate() + 1);
        batidaEndData.setUTCDate(batidaEndData.getUTCDate() + 1);

        if (bancoUpdated) {

          let lastDateBatidaString = await batidasHandler.findLastDate(codigo);
          let lastDateBatida = new Date(lastDateBatidaString);

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


      } while (bancoUpdateNext);

      res.json({
        err: false
      });
      
      conn.close();

    } catch (error) {

      console.log(error);
      conn.close();

      res.json({
        err: true
      })

    }

  });

});

router.get('/empresa', async function (req, res, next) {

  let conn = mongoose.createConnection('mongodb://127.0.0.1/ponto');

  let Empresa = conn.model('empresas', Empresas);

  Empresa.findOne({}, function (err, empresa) {

    conn.close();
    res.json({
      empresa
    });

  })

});

router.post('/altera_banco', (req, res, next) => {

  let horas = req.body.horas;
  let codigo = req.body.codigo;
  let sum = req.body.sum;
  let data = req.body.data;

  let conn = mongoose.createConnection('mongodb://127.0.0.1/ponto');

  let BancoHora = conn.model('banco_horas', BancoHoras);

  let bancoDate = new Date(data);

  bancoDate.setUTCHours(0);
  bancoDate.setUTCMinutes(0);
  bancoDate.setUTCSeconds(0);
  bancoDate.setUTCMilliseconds(0);

  BancoHora.findOne({
    codigo: codigo,
    data: bancoDate
  }, (err, banco) => {

    if (banco != null && banco != undefined) {

      let millisTime = BancoHandler.diffBetweenTimes("00:00", horas);

      let batidasHandler = new BatidaHandler(conn);
      let bancoHandler = new BancoHandler(conn);
      let estagiariosHandler = new EstagiarioHandler(conn);

      if (sum == 'true') {

        banco.credito += millisTime;
        banco.valorAcumulado += millisTime;
      } else {

        banco.debito -= millisTime;
        banco.valorAcumulado -= millisTime;
      }

      banco.save(async (err) => {

        if (err) {
          res.json({
            err: "Erro ao salvar alterações!"
          })
        }

        try {

          let batidaEndData = new Date(bancoDate.getTime());

          batidaEndData.setUTCHours(23);
          batidaEndData.setUTCMinutes(59);

          bancoDate.setUTCDate(bancoDate.getUTCDate() + 1);
          batidaEndData.setUTCDate(batidaEndData.getUTCDate() + 1);

          let estagiario = await estagiariosHandler.findByCode(codigo);

          let bancoUpdateNext = false;

          do {

            let bancoUpdated = false;

            let batidas = await batidasHandler.getBatidas(codigo, bancoDate, batidaEndData);

            bancoUpdated = await bancoHandler.atualizarBanco({
              estagiario,
              data: bancoDate,
              batidas
            });

            bancoDate.setUTCDate(bancoDate.getUTCDate() + 1);
            batidaEndData.setUTCDate(batidaEndData.getUTCDate() + 1);

            if (bancoUpdated) {

              let lastDateBatidaString = await batidasHandler.findLastDate(codigo);
              let lastDateBatida = new Date(lastDateBatidaString);

              if (lastDateBatida.getUTCFullYear() >= bancoDate.getUTCFullYear()) {

                if (lastDateBatida.getUTCMonth() > bancoDate.getUTCMonth()) {

                  bancoUpdateNext = true;

                } else if (lastDateBatida.getUTCMonth() == bancoDate.getUTCMonth() && lastDateBatida.getUTCDate() >= bancoDate.getUTCDate()) {

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


          } while (bancoUpdateNext);

          res.json({
            err: false
          });
          conn.close();

        } catch (error) {

          console.log(error);
          conn.close();

          res.json({
            err: true
          });

        }

      });

    }

  })


});

module.exports = router;