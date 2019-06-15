var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var ChallengeSchema = new Schema({
    challengeId: mongoose.SchemaTypes.ObjectId,
    title: String,
    description: String,
    date: {type: Date}
})



module.exports = mongoose.model('challenges',ChallengeSchema)
