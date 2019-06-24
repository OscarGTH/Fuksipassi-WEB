var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var ChallengeSchema = new Schema({
    challengeId: mongoose.SchemaTypes.ObjectId,
    title: String,
    description: String,
    date: {type: Date},
    area: String
})



module.exports = mongoose.model('challenges',ChallengeSchema)
