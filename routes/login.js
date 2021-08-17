var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Users = require('../Schemas/Users');

/* GET login page. */
router.get('/', function (req, res, next) {
    res.render('login', {
        error: undefined
    });
});

router.post('/', function (req, res, next) {

    let usuario = req.body.user;
    let senha = req.body.pass;

    if (!usuario || !senha) {
        res.render('login', {
            error: 'Usuário ou senha não enviados corretamente!'
        });
    } else {

        let conn = mongoose.createConnection('mongodb://127.0.0.1/ponto');

        let Usuario = conn.model('usuarios', Users);

        Usuario.findOne({
            usuario: usuario
        }, function (err, usuario) {
            conn.close();
            if (usuario) {
                if (usuario.senha == senha){
                    req.session.autorizado = true;
                    req.session.nivel = usuario.nivel;
                    res.redirect('/');
                }                    
                else
                    res.render('login', {
                        error: 'Usuário ou senha incorretos.'
                    });
            } else {
                res.render('login', {
                    error: 'Usuário ou senha incorretos.'
                });
            }

        });

    }

});

module.exports = router;