var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Feriados = require('../Schemas/Feriados');

/* GET feriados page. */
router.get('/', function (req, res, next) {

  let conn = mongoose.createConnection('mongodb://127.0.0.1/ponto');

  let Feriado = conn.model('feriados', Feriados);

  Feriado.find({}, function (err, feriados) {
    conn.close();
    res.render('feriados', {
      feriados: feriados,
      error: undefined
    });
  });


});

router.post('/', function (req, res, next) {

  let nome = req.body.nome || '';
  let dtInicial = req.body.dtInicial || '';
  let dtFinal = req.body.dtFinal || '';

  let conn = mongoose.createConnection('mongodb://127.0.0.1/ponto');

  let Feriado = conn.model('feriados', Feriados);

  let newFeriado = new Feriado({
    nome: nome,
    dtInicial: dtInicial,
    dtFinal: dtFinal
  });

  newFeriado.save(function (err) {

    if (err) {

      Feriado.find({}, function (err, feriados) {
        conn.close();
        res.render('feriados', {
          feriados: feriados,
          error: 'Não foi possivel cadastrar novo feriado.'
        });

      });

    } else {

      Feriado.find({}, function (err, feriados) {
        conn.close();
        res.render('feriados', {
          feriados: feriados,
          error: undefined
        });

      });

    }

  });

});


router.delete('/:id', function(req, res, next){

  let conn = mongoose.createConnection('mongodb://127.0.0.1/ponto');

  let Feriado = conn.model('feriados', Feriados);

  Feriado.findByIdAndRemove(req.params.id, function (err) {
    conn.close();
    if (err)
      res.json({
        error: true
      });
    else {
      res.json({
        error: false
      });
    }
  });

});

module.exports = router;