const express = require('express');
const path = require('path');
const http = require('http');
const PORT = process.env.PORT ||3000;
const socketio = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketio(server);

//staticka slozka
app.use(express.static(path.join(__dirname, "public")))

//spusteni serveru
server.listen(PORT,()=>console.log(`Server running on ${PORT}`));

//socket pripojeni

const connections = [null, null]
io.on('connection', socket =>{
    console.log('New WS Connection')
    
    //hledame dostupna cislo pro hrace
    let playerIndex = -1;
    for(const i in connections){
        if( connections[i] ===null){
            playerIndex = i
            break
        }
    }

     //jaky hrac je pripojeny uzivatel
     socket.emit('player-number', playerIndex)
     console.log(`Player${playerIndex} has connected`)

          // ignorovat hrace 3+
          if(playerIndex === -1)return
});
