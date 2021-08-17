var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Estagiarios = new Schema({
    nome: String,
    dtNasc : Date,
    rg: String,
    cpf: String,
    email: String,
    codigo: String,
    dtAdmissao: Date,
    setor: String,
    horarios: {
        segunda: Array,
        segundaExtra: Boolean,
        segundaFolga: Boolean,
        segundaTotal: String,
        terca: Array,
        tercaExtra: Boolean,
        tercaFolga: Boolean,
        tercaTotal: String,
        quarta: Array,
        quartaExtra: Boolean,
        quartaFolga: Boolean,
        quartaTotal: String,
        quinta: Array,
        quintaExtra: Boolean,
        quintaFolga: Boolean,
        quintaTotal: String,
        sexta: Array,
        sextaExtra: Boolean,
        sextaFolga: Boolean,
        sextaTotal: String,
        sabado: Array,
        sabadoExtra: Boolean,
        sabadoFolga: Boolean,
        sabadoTotal: String,
        domingo: {type: Array, default: ['Folga', 'Folga', 'Folga', 'Folga', 'Folga', 'Folga']},
        domingoFolga: {type: Boolean, default: true},
        domingoExtra: {type: Boolean, default: false}
    }
});


module.exports = Estagiarios;