var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Feriados = new Schema({
    nome: String,
    dtInicial: Date,
    dtFinal: Date
});

module.exports = Feriados;