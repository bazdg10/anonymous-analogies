const mongoose = require('mongoose')
const Schema = mongoose.Schema
const roomSchema = Schema({
    name: { type: String, required:  true },
    game: { type: Number, default: 0 },
    rounds: { type: Number, default: 7 },
    dummy: { type: [String] },      // stores player's email    // Data retrieval 
    scores: {type: [Number]},
    players: {type: [String]},      // stores player's socket-id 
    analogy: {type: Number},       // stores index of last analogy   
    assigned: { type: String },  // stores last assigned player
    responses: { type: [String] },
    votes: { type: [Number] }
})
const Room = mongoose.model('room', roomSchema)
module.exports = Room