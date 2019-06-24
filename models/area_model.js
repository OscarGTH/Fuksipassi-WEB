var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var AreaSchema = new Schema({
    name: String,
    password: String
})



module.exports = mongoose.model('areas',AreaSchema)
