const path = require('path')
const express = require('express')
const http = require('http')
const socketio = require('socket.io')

const PORT = 2000 || process.env.PORT
const app = express()
const server = http.createServer(app)
const io = socketio(server)

// Set statuc folder
app.use(express.static(path.join(__dirname, 'public')))

//Run when cliente connects
io.on('connection', socket => {

  // Welcome current user
  socket.emit('message', 'Welcome to world')

  // Broadcast when a user connect (emit all client except connecting client)
  socket.broadcast.emit('message', 'A user has joined the chat')

  // Runs when client disconnect
  socket.on('disconnect', () => {
    console.log('YA')
    io.emit('message', 'A user has left the chat')

  });

})


server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})