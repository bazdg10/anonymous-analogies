const express = require('express')
const cors = require('cors')
require('dotenv').config()
const mongoose = require('mongoose')
const app = express()
const bodyParser = require('body-parser')
const { analogies } = require('./analogies.js')
// app.use(cors())
const Room = require('./models/Room.js')
const User = require('./models/User.js')
app.use(bodyParser.urlencoded({
    extended: true
  }));
app.use(bodyParser.json())
const http = require('http')
const server = http.createServer(app);
let io = require('socket.io')(server, {
  cors: {
    origin: '*',
  }
})
app.use(cors())
app.set('io', io)

const PORT = 5000 || process.env.PORT
mongoose.connect(process.env.DB, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => app.listen(PORT, () => console.log(`Server Started on ${PORT}`)) )
        .catch(error => console.log(error.message) )

mongoose.connect(process.env.ROOM, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(()=> {console.log(`Rooms are active`)})
        .catch(error => console.log(error.message))




// MODERATOR REQUESTS TO CREATE ROOM
app.post('/createRoom', async (req, res) => {
    var { name, players } = req.body
    var rounds = players
    await Room.save({name, rounds})
    return res.status(200).send({ roomName: name })
})



app.get('/game', (req, res) => {


// io.on('gamemessage', ( {room, message} )=> {

//     var room = Room.find({name: room})
    
// if (room && room.assigned==0){
//     // Server generating a message
//     var spy = Math.floor(Math.random()*room.playing)
//     var level = room.playing - room.rounds
//     room.rounds--;
//     // var sids = []
//     for ( var j=0; j<room.playing; j++ ) {
//         if (j==spy) {
//             io.to(room.players[spy]).emit('spymessage', { text: `You're the spy!` })
//         }
//         else 
//             io.to(room.players[j]).emit(`gamemessage`, { analogy: analogies[level][0].stmt })    
//     }
// } else {
//     var guess = message

// }
//     // io.sockets.in(sids).emit();
// })  

var generator = (room) => {
    var j = Math.floor(Math.random()*room.playing);
    var idx = Math.floor(Math.random()*analogies[9-room.rounds].length);
    return [j, idx];
}


io.on('connect', (socket) => {
    
    socket.on('join', async ({ email, roomname }) => {
        const user = await User.find({email})
        if (!user) {
            // CREATE SOME SORT OF AUTH ETC.
            User.save({email, tempId: socket.id})
        }
        const room = await Room.find({name: roomname})
        
        if (user.room && user.room!=room) {
            // PLAYER OF SOME OTHER GAME
            socket.emit('servermessage', { user: 'server', text: `Go to your game`});
        }
        else
        {
            if (room) {
                // user.room = roomname;
                // User.findByIdAndUpdate(user._id, user);
                // GAME NOT STARTED
            if (room.game==0) {
                room.dummy.push(email);
                room.players.push(socket.id);
                room.scores.push(0);
                user.score = 0;
                user.lastScore = 0;
                user.room = roomname;
                User.save(user);
                // I can start game if everyone has joined the game
                if (room.players.length==room.playing) {    
                    room.game = 1;
                    var a = [];
                    a = generator(room);
                    j = a[0]; idx = a[1];
                    room.analogy = idx;
                    room.assigned = j;
                    Room.findByIdAndUpdate(room._id, room);
                    for ( var k=0; k<room.players.length; k++ ) {
                        if (k==j) continue;
                        io.to(room.players[k]).emit('gamemessage', { user: `server`, text: `${analogies[idx].stmt}` });
                    }
                    
                } else {
                    socket.emit('servermessage', { user: `server`, text: `Waiting for others to join` });
                }
            } else {
               // GAME IS ALREADY GOING ON 
               if (room.dummy.indexOf(email)!==-1) {
                // USER GOT LOGGED OUT DUE TO SOME REASON
                room.players.push(socket.id)    
                room.scores.push(user.lastScore)
                room.dummy.splice(room.dummy.indexOf(email), 1)
                room.dummy.push(email);
                user.room = roomname          
                Room.save(room)
                User.save(user)      
                }  else {
                    // RANDOM PERSON WALKED INTO AN ON-GOING GAME
                    socket.emit('servermessage', { user: `server`, text: `Sorry game has started` } )
                }
            }

        } else {
            socket.emit('servermessage', { user: 'server', text: ` Room doesn't exist `});
        } 
        } 
    })

    socket.on('gamemessage', async (reply) => {
        var user = await User.find({tempId: socket.id});
        if (user!==undefined) {
            var room = Room.find({ name: user.room });
            if (room!==undefined) {
                if (reply.word) {
                    // guess is the statement
                    if ( reply.word == room.assigned ) {
                        room.score[room.players.indexOf(reply.word)] += 2;
                        room.votes.push(1);
                    } else {
                        room.votes.push(0);
                    }
                    if (room.votes.length==room.dummy.length) {
                        // ALL Players have responded                            
                        room.rounds--;
                        var sc = 0;
                        for ( var i=0; i<room.votes.length; i++ ) {
                            sc += room.votes[i];
                        }
                        if (sc*2 < room.score) {
                            room.score[room.players.indexOf(reply.word)] += 2;
                        }

                        // GENERATING NEW ANALOGY
                        var a = [];
                        a = generator(room);
                        j = a[0]; idx = a[1];
                        room.analogy = idx;
                        room.assigned = j;
                        Room.findByIdAndUpdate(room._id, room);
                        for ( var k=0; k<room.players.length; k++ ) {
                            if (k==j) continue;
                            io.to(room.players[k]).emit('gamemessage', { user: `server`, text: `${analogies[idx].stmt}` });
                        }
                    }
                Room.findByIdAndUpdate(room._id, room);
                
                } else if (reply.stmt) {
                    // The impostor sends stmt
                    room.responses.push(reply.stmt);
                    Room.findByIdAndUpdate(room._id, room);
                    if ( room.responses.length == room.dummy.length )
                        socket.emit('gamemessage', { user: `server`, responses : `${room.responses}` });
                }
            }
        } 
        /// GAME LOGIC TO BE IMPLEMENTED
        


    })

    socket.on('disconnect', async () => {
        var user = await User.find({tempId: socket.id})
        if (user) {
            var roomname = user.room;
            var room = await Room.find({ name: roomname })
            if (room) {
                var id = room.dummy.indexOf(socket.id)
                if (id!==-1) {
                    // USER WAS PLAYING THE GAME
                    user.tempId = "";
                    room.players.splice(id, 1)
                    room.playing--
                    user.last = room.scores[id]
                    room.scores.splice(id, 1)
                    if ( room.dummy.length==0 ) {
                        // GAME HAS ENDED
                        for ( var i=0; i<room.dummy.length; i++ ) {

                            var usr = await User.find({email: room.players[i]})
                            // Updating User's actual score
                            user.score += user.lastScore
                            user.lastScore = 0
                            User.save(user)
                        }
                        await Room.deleteOne({_id: room._id})
                    } else {
                        await Room.save(room);
                    }
                } 
            }
        } 
    })

});
})

// server.listen(PORT, () => console.log(`Server has started.`));