var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Batidas = new Schema({
    codigo: String,
    data: Date,
    timezone: Number,
    manual: {type: Boolean, default: false}
});

module.exports = Batidas;