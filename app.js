var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var index = require('./routes/index');
var login = require('./routes/login');
var estagiarios = require('./routes/estagiarios');
var relatorios = require('./routes/relatorios');
var usuarios = require('./routes/usuarios');
var feriados = require('./routes/feriados');
var empresa = require('./routes/empresa');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  secret: 'v1l4r1c4',
  resave: false,
  saveUninitialized: false
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/libs/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap/dist')));
app.use('/libs/jquery', express.static(path.join(__dirname, 'node_modules/jquery/dist')));
app.use('/libs/jquery-mask', express.static(path.join(__dirname, 'node_modules/jquery-mask-plugin/dist')));
app.use('/libs/pdfmake', express.static(path.join(__dirname, 'node_modules/pdfmake/build')));

let authFunction = function(req, res, next){
  if(!req.session || !req.session.autorizado){
    res.redirect('/login');
  }else{
    next();
  }
}

app.use('/login', login);
app.use(authFunction);

app.use('/', index);
app.use('/estagiarios', estagiarios);
app.use('/relatorios', relatorios);
app.use('/empresa', empresa);
app.use('/feriados', feriados);
app.use('/usuarios', usuarios);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
