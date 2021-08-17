var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Users = new Schema({
    nome: String,
    usuario: String,
    senha: String,
    nivel: Number
});

module.exports = Users;