const mongoose = require('mongoose')
const Schema = mongoose.Schema
const roomSchema = Schema({
    name: { type: String, required:  true },
    playing: { type: Number, default: 8 },
    game: { type: Number, default: 0 },
    dummy: { type: [String] },      // stores player's email    // Data retrieval 
    scores: {type: [Number]},
    players: {type: [String]},      // stores player's socket-id 
    analogies: {type: [String]}
})
const Room = mongoose.model('room', roomSchema)
module.exports = Room