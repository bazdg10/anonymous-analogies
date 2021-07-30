const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = Schema({
    email: { type: String, require: true },
    score: { type: Number, default: 0},
    tempId: { type: String },
    room: { type: String },
    lastScore: {type: Number}
})

const User = mongoose.model('user', userSchema)



module.exports = User