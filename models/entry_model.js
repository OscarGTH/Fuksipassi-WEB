var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var EntrySchema = new Schema({
  challengeId: ObjectId,
  userId: ObjectId,
  date: { type: Date, default: Date.now},
  img: { data: Buffer, contentType: String}
})


module.exports = mongoose.model('entries',EntrySchema)
