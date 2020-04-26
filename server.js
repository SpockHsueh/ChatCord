const path = require('path')
const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const formatMessage = require('./utils/message.js')
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users.js')


const PORT = 2000 || process.env.PORT
const app = express()
const server = http.createServer(app)
const io = socketio(server)

// Set statuc folder
app.use(express.static(path.join(__dirname, 'public')))

const botName = 'ChatCord Bot'

//Run when cliente connects
io.on('connection', socket => {

  socket.on('joinRoom', ({ username, room }) => {

    const user = userJoin(socket.id, username, room)

    socket.join(user.room)

    // Welcome current user
    socket.emit('message', formatMessage(botName, 'Welcome to ChatCord!'))

    // Broadcast when a user connect (emit all client except connecting client)
    socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${username} has joined the chat`))

    // Send users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    })
  })

  // Listen for chatMessage
  socket.on('chatMessage', msg => {
    const user = getCurrentUser(socket.id)
    console.log(user)
    io.to(user.room).emit('message', formatMessage(user.username, msg))
  })

  // Runs when client disconnect
  socket.on('disconnect', () => {
    const user = userLeave(socket.id)
    if (user) {
      // Broadcast to everyone
      io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the chat`))

      // Send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      })
    }
  })
})


server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})