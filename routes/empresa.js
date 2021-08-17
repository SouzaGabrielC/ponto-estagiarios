var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Empresas = require('../Schemas/Empresa');
mongoose.Promise = global.Promise;

/* GET empresa page. */
router.get('/', function(req, res, next) {

  let conn = mongoose.createConnection('mongodb://127.0.0.1/ponto');

  let Empresa = conn.model('empresas', Empresas);

  Empresa.findOne({}, function(err, empresa){
    
    conn.close();
    res.render('empresa', {
      empresa: empresa,
      error: undefined
    });
  })

});

router.post('/', function(req, res, next){

  let nome = req.body.nome || '';
  let cnpj = req.body.cnpj || '';


  let conn = mongoose.createConnection('mongodb://127.0.0.1/ponto');

  let Empresa = conn.model('empresas', Empresas);

  Empresa.findOneAndUpdate({}, {$set:{nome: nome, cnpj: cnpj}}, {new: true} ,function(err, empresa){
    conn.close();
    if(err){
      res.render('empresa',{
      empresa: empresa,
      error: "Erro ao atualizar os dados da empresa."
    });
    }

    res.render('empresa',{
      empresa: empresa,
      error: undefined
    });

  });

});

module.exports = router;
