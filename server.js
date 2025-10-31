const express = require('express');
const app = express();
const http = require('http').createServer(app);
const { Server } = require('socket.io');
const io = new Server(http);

app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('🟢 A player connected:', socket.id);

  socket.on('makeMove', (data) => {
    // Send move to other player
    socket.broadcast.emit('moveMade', data);
  });

  socket.on('resetGame', () => {
    io.emit('gameReset');
  });

  socket.on('disconnect', () => {
    console.log('🔴 Player disconnected:', socket.id);
  });
});

const PORT = 3000;
http.listen(PORT, () => {
  console.log(`✅ Server running at: http://localhost:${PORT}`);
});
