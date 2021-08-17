var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Estagiarios = require('../Schemas/Estagiario');
var Batidas = require('../Schemas/Batidas');
mongoose.Promise = global.Promise;

let EstagiarioHandler = require('../classes/EstagiarioHandler');
let BatidasHandler = require('../classes/BatidasHandler');
let BancoHandler = require('../classes/BancoHorasHandler');

/* GET estagiarios page. */
router.get('/', function (req, res, next) {

  let conn = mongoose.createConnection('mongodb://127.0.0.1/ponto');

  let Estagiario = conn.model('estagiarios', Estagiarios);

  Estagiario.find({}, function (err, estagiarios) {

    conn.close();
    res.render('estagiarios', {
      estagiarios: estagiarios,
      error: undefined
    });

  });

});

router.get('/stats', (req, res, next)=>{
  
    let conn = mongoose.createConnection('mongodb://127.0.0.1/ponto');
    
    let Estagiario = conn.model('estagiarios', Estagiarios);
  
  
    Estagiario.collection.stats((err, stats)=>{
  
      res.send(`Size: ${stats.storageSize}`);
  
    });
    
  
  });

router.post('/', function (req, res, next) {

  let codigo = req.body.codigo || '';
  let nome = req.body.nome || '';
  let email = req.body.email || '';
  let dtNasc = req.body.dtNasc || '';
  let rg = req.body.rg || '';
  let cpf = req.body.cpf || '';
  let dtAdmissao = req.body.dtAdmissao || '';
  let segExtra = req.body.segExtra || false;
  let terExtra = req.body.terExtra || false;
  let quaExtra = req.body.quaExtra || false;
  let quiExtra = req.body.quiExtra || false;
  let sexExtra = req.body.sexExtra || false;
  let sabExtra = req.body.sabExtra || false;
  let segFolga = req.body.segFolga || false;
  let terFolga = req.body.terFolga || false;
  let quaFolga = req.body.quaFolga || false;
  let quiFolga = req.body.quiFolga || false;
  let sexFolga = req.body.sexFolga || false;
  let sabFolga = req.body.sabFolga || false;
  let segunda = [req.body.segE1, req.body.segS1, req.body.segE2, req.body.segS2, req.body.segE3, req.body.segS3];
  let terca = [req.body.terE1, req.body.terS1, req.body.terE2, req.body.terS2, req.body.terE3, req.body.terS3];
  let quarta = [req.body.quaE1, req.body.quaS1, req.body.quaE2, req.body.quaS2, req.body.quaE3, req.body.quaS3];
  let quinta = [req.body.quiE1, req.body.quiS1, req.body.quiE2, req.body.quiS2, req.body.quiE3, req.body.quiS3];
  let sexta = [req.body.sexE1, req.body.sexS1, req.body.sexE2, req.body.sexS2, req.body.sexE3, req.body.sexS3];
  let sabado = [req.body.sabE1, req.body.sabS1, req.body.sabE2, req.body.sabS2, req.body.sabE3, req.body.sabS3];
  let setor = req.body.setor || '';
  let segTotal = req.body.segTotal || "";
  let terTotal = req.body.terTotal || "";
  let quaTotal = req.body.quaTotal || "";
  let quiTotal = req.body.quiTotal || "";
  let sexTotal = req.body.sexTotal || "";
  let sabTotal = req.body.sabTotal || "";

  let conn = mongoose.createConnection('mongodb://127.0.0.1/ponto');

  let Estagiario = conn.model('estagiarios', Estagiarios);

  if (codigo && nome) {

    if (dtNasc != '')
      dtNasc = new Date(dtNasc);

    if (dtAdmissao != '')
      dtAdmissao = new Date(dtAdmissao);

    let estagiario = new Estagiario({
      nome: nome,
      codigo: codigo,
      dtNasc: dtNasc,
      dtAdmissao: dtAdmissao,
      email: email,
      rg: rg,
      cpf: cpf,
      setor: setor,
      horarios: {
        segunda: segunda,
        segundaExtra: segExtra,
        segundaFolga: segFolga,
        segundaTotal: segTotal,
        terca: terca,
        tercaExtra: terExtra,
        tercaFolga: terFolga,
        tercaTotal: terTotal,
        quarta: quarta,
        quartaExtra: quaExtra,
        quartaFolga: quaFolga,
        quartaTotal: quaTotal,
        quinta: quinta,
        quintaExtra: quiExtra,
        quintaFolga: quiFolga,
        quintaTotal: quiTotal,
        sexta: sexta,
        sextaExtra: sexExtra,
        sextaFolga: sexFolga,
        sextaTotal: sexTotal,
        sabado: sabado,
        sabadoExtra: sabExtra,
        sabadoFolga: sabFolga,
        sabadoTotal: sabTotal
      }
    });

    estagiario.save(function (err) {

      Estagiario.find({}, function (err, estagiarios) {

        conn.close();
        res.render('estagiarios', {
          estagiarios: estagiarios,
          error: undefined
        });

      });

    });



  } else {

    Estagiario.find({}, function (err, estagiarios) {

      conn.close();
      res.render('estagiarios', {
        estagiarios: estagiarios,
        error: "Código e nome são obrigatórios!"
      });

    });
  }

});


router.get('/:codigo', function (req, res, next) {

  let conn = mongoose.createConnection('mongodb://127.0.0.1/ponto');

  let Estagiario = conn.model('estagiarios', Estagiarios);

  Estagiario.findOne({
    codigo: req.params.codigo
  }, function (err, estagiario) {

    conn.close();
    res.render('editEstagiario', {
      estagiario: estagiario,
      error: undefined
    });

  });

});

router.post('/:codigo', function (req, res, next) {

  let conn = mongoose.createConnection('mongodb://127.0.0.1/ponto');

  let Estagiario = conn.model('estagiarios', Estagiarios);
  console.log('SABADO: ', req.body.sabE1);
  let codigo = req.body.codigo || '';
  let nome = req.body.nome || '';
  let email = req.body.email || '';
  let dtNasc = req.body.dtNasc || '';
  let rg = req.body.rg || '';
  let cpf = req.body.cpf || '';
  let dtAdmissao = req.body.dtAdmissao || '';
  let segunda = [req.body.segE1, req.body.segS1, req.body.segE2, req.body.segS2, req.body.segE3, req.body.segS3];
  let terca = [req.body.terE1, req.body.terS1, req.body.terE2, req.body.terS2, req.body.terE3, req.body.terS3];
  let quarta = [req.body.quaE1, req.body.quaS1, req.body.quaE2, req.body.quaS2, req.body.quaE3, req.body.quaS3];
  let quinta = [req.body.quiE1, req.body.quiS1, req.body.quiE2, req.body.quiS2, req.body.quiE3, req.body.quiS3];
  let sexta = [req.body.sexE1, req.body.sexS1, req.body.sexE2, req.body.sexS2, req.body.sexE3, req.body.sexS3];
  let sabado = [req.body.sabE1, req.body.sabS1, req.body.sabE2, req.body.sabS2, req.body.sabE3, req.body.sabS3];
  let setor = req.body.setor || '';
  let segExtra = req.body.segExtra;
  let terExtra = req.body.terExtra;
  let quaExtra = req.body.quaExtra;
  let quiExtra = req.body.quiExtra;
  let sexExtra = req.body.sexExtra;
  let sabExtra = req.body.sabExtra;
  let segFolga = req.body.segFolga;
  let terFolga = req.body.terFolga;
  let quaFolga = req.body.quaFolga;
  let quiFolga = req.body.quiFolga;
  let sexFolga = req.body.sexFolga;
  let sabFolga = req.body.sabFolga;
  let segTotal = req.body.segTotal || "";
  let terTotal = req.body.terTotal || "";
  let quaTotal = req.body.quaTotal || "";
  let quiTotal = req.body.quiTotal || "";
  let sexTotal = req.body.sexTotal || "";
  let sabTotal = req.body.sabTotal || "";

  Estagiario.findOneAndUpdate({
    codigo: req.params.codigo
  }, {
    $set: {
      nome: nome,
      codigo: codigo,
      dtNasc: dtNasc,
      dtAdmissao: dtAdmissao,
      email: email,
      rg: rg,
      cpf: cpf,
      setor: setor,
      horarios: {
        segunda: segunda,
        segundaExtra: segExtra,
        segundaFolga: segFolga,
        segundaTotal: segTotal,
        terca: terca,
        tercaExtra: terExtra,
        tercaFolga: terFolga,
        tercaTotal: terTotal,
        quarta: quarta,
        quartaExtra: quaExtra,
        quartaFolga: quaFolga,
        quartaTotal: quaTotal,
        quinta: quinta,
        quintaExtra: quiExtra,
        quintaFolga: quiFolga,
        quintaTotal: quiTotal,
        sexta: sexta,
        sextaExtra: sexExtra,
        sextaFolga: sexFolga,
        sextaTotal: sexTotal,
        sabado: sabado,
        sabadoExtra: sabExtra,
        sabadoFolga: sabFolga,
        sabadoTotal: sabTotal
      }
    }
  }, {
    new: true
  }, function (err, estagiario) {
    conn.close();

    if (err) {
      res.render('editEstagiario', {
        estagiario: estagiario,
        error: 'Não foi possível editar o estagiário.'
      });
    } else {
      res.render('editEstagiario', {
        estagiario: estagiario,
        error: undefined
      });
    }

  });

});

router.delete('/:codigo', async function (req, res, next) {

  let conn = mongoose.createConnection('mongodb://127.0.0.1/ponto');

  let estagiarioHandler = new EstagiarioHandler(conn);
  let batidasHandler = new BatidasHandler(conn);
  let bancoHandler = new BancoHandler(conn);

  try {

    let estagiarioDeleted = await estagiarioHandler.deleteByCode(req.params.codigo);

    if(estagiarioDeleted){

      let bancosDeleted = await bancoHandler.deleteByEstagiarioCode(req.params.codigo);
      let batidasDeleted = await batidasHandler.deleteByEstagiarioCode(req.params.codigo);
      
      if(bancosDeleted && batidasDeleted){
        res.json({
          error: false
        });
      }

    }

    
  } catch (error) {
    console.log(error);
    conn.close();
    res.json({
      error: true
    });
  }

});




module.exports = router;