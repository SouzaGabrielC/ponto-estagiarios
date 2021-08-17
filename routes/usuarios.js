var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Usuarios = require('../Schemas/Users');
mongoose.Promise = global.Promise;

router.use(function (req, res, next) {
  if (req.session.nivel != 1) {
    res.redirect('/');
  } else {
    next();
  }
})

/* GET usuarios page. */
router.get('/', function (req, res, next) {

  let conn = mongoose.createConnection('mongodb://127.0.0.1/ponto');

  let Usuario = conn.model('usuarios', Usuarios);

  Usuario.find({}, function (err, usuarios) {

    conn.close();
    res.render('usuarios', {
      usuarios: usuarios,
      error: undefined
    });

  });

});

router.post('/', function (req, res, next) {

  let nome = req.body.nome || null;
  let usuario = req.body.usuario || null;
  let senha = req.body.senha || null;
  let nivel = req.body.nivel || null;

  let conn = mongoose.createConnection('mongodb://127.0.0.1/ponto');

  let Usuario = conn.model('usuarios', Usuarios);


  if (nome && senha && usuario && nivel) {

    let newUsuario = new Usuario({
      nome: nome,
      usuario: usuario,
      senha: senha,
      nivel: nivel
    });

    newUsuario.save(function (err) {

      Usuario.find({}, function (err, usuarios) {

        conn.close();
        res.render('usuarios', {
          usuarios: usuarios,
          error: undefined
        });

      });

    });



  } else {

    Usuario.find({}, function (err, usuarios) {

      conn.close();
      res.render('usuarios', {
        usuarios: usuarios,
        error: "Todos os campos são obrigatórios!"
      });
    });

  }

});

router.get('/:id', function (req, res, next) {

  let conn = mongoose.createConnection('mongodb://127.0.0.1/ponto');

  let Usuario = conn.model('usuarios', Usuarios);

  Usuario.findOne({
    _id: req.params.id
  }, function (err, usuario) {

    conn.close();

    res.render('editUsuario', {
      usuario: usuario,
      error: undefined
    });

  });

});

router.post('/:id', function (req, res, next) {

  let conn = mongoose.createConnection('mongodb://127.0.0.1/ponto');

  let Usuario = conn.model('usuarios', Usuarios);

  let usuario = req.body.usuario || '';
  let nome = req.body.nome || '';
  let senha = req.body.senha || '';
  let nivel = req.body.nivel || '';
  
  console.log('Update 1');

  Usuario.findByIdAndUpdate(req.params.id, {$set: {nome: nome, usuario: usuario, senha: senha, nivel:nivel} }, { new: true}, function(err, usuario){
    
    conn.close();

    if(err){
      res.render('editUsuario', {
        usuario: usuario,
        error: 'Não foi possível editar o usuário.'
      });
    }
    else{
      res.render('editUsuario', {
        usuario: usuario,
        error: undefined
      });
    }

  });

});

router.delete('/:id', function (req, res, next) {

  let conn = mongoose.createConnection('mongodb://127.0.0.1/ponto');

  let Usuario = conn.model('usuarios', Usuarios);

  Usuario.findByIdAndRemove(req.params.id, function (err) {
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