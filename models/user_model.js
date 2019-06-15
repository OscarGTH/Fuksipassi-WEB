var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var UserSchema = new Schema({
  email: String,
  password: String,
  role: Number,
  userId: ObjectId
})


module.exports = mongoose.model('users',UserSchema)
