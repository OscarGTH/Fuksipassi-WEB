var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var EntrySchema = new Schema({
  challengeId: ObjectId,
  userId: ObjectId,
  email: String,
  date: { type: Date, default: Date.now},
  img: { data: Buffer, contentType: String},
  verified: Boolean
})


module.exports = mongoose.model('entries',EntrySchema)
