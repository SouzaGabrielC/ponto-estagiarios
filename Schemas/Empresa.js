var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Empresa = new Schema({
    nome: String,
    cnpj: String
});

module.exports = Empresa;