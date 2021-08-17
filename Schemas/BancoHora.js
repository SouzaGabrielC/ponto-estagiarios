var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BancoHora = new Schema({
    codigo: String,
    data: Date,
    credito: Number,
    debito: Number,
    valorAcumulado: Number
});


module.exports = BancoHora;