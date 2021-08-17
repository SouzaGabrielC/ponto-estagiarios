var express = require('express');
var router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { nivel: req.session.nivel });
});

router.get('/logout', function(req, res, next){
  req.session.autorizado = false;
  req.session.nivel = undefined;
  res.redirect('/login');
});

module.exports = router;
