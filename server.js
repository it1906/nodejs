const express = require('express')
const path = require('path')
const http = require('http')
const PORT = process.env.PORT || 3000
const socketio = require('socket.io')
const app = express()
const server = http.createServer(app)
const io = socketio(server)

app.use(express.static(path.join(__dirname, "public")))

// start
server.listen(PORT, () => console.log(`Server running on port ${PORT}`))

const connections = [null, null]

io.on('connection', socket => {

  // hledani dostupneho poradi hrace
  let playerIndex = -1;
  for (const i in connections) {
    if (connections[i] === null) {
      playerIndex = i
      break
    }
  }

  // jake mate cislo
  socket.emit('player-number', playerIndex)

  console.log(`Player ${playerIndex} has connected`)

  // ignorovani hracu 3 a vice
  if (playerIndex === -1) return

  connections[playerIndex] = false

  // kdo se pripojil
  socket.broadcast.emit('player-connection', playerIndex)

  // odpojovani
  socket.on('disconnect', () => {
    console.log(`Player ${playerIndex} disconnected`)
    connections[playerIndex] = null
    socket.broadcast.emit('player-connection', playerIndex)
  })

  // ready
  socket.on('player-ready', () => {
    socket.broadcast.emit('enemy-ready', playerIndex)
    connections[playerIndex] = true
  })

  // kontrola jestli je hrac ready
  socket.on('check-players', () => {
    const players = []
    for (const i in connections) {
      connections[i] === null ? players.push({connected: false, ready: false}) : players.push({connected: true, ready: connections[i]})
    }
    socket.emit('check-players', players)
  })

});
