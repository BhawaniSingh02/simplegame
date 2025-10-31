const express = require("express");
const app = express();
const http = require("http").createServer(app);
const { Server } = require("socket.io");
const io = new Server(http, {
  cors: {
    origin: "*",
  },
});

app.use(express.static("public"));

let players = [];
let currentTurn = null;

// 🟢 When a player connects
io.on("connection", (socket) => {
  console.log("🟢 Player connected:", socket.id);

  // Add player if room not full
  if (players.length < 2) {
    players.push(socket.id);
    console.log("Players:", players);
  } else {
    socket.emit("roomFull");
    return;
  }

  // Start game if 2 players connected
  if (players.length === 2 && !currentTurn) {
    currentTurn = players[0];
    io.to(currentTurn).emit("yourTurn");
    io.to(players[1]).emit("waitTurn");
  }

  // 🔹 Handle move
  socket.on("makeMove", (data) => {
    if (socket.id !== currentTurn) return;

    const opponent = players.find((id) => id !== socket.id);

    // Send move to opponent
    socket.to(opponent).emit("moveMade", data);

    // Switch turn
    currentTurn = opponent;
    io.to(currentTurn).emit("yourTurn");
    io.to(socket.id).emit("waitTurn");
  });

  // 🔹 Handle game reset
  socket.on("resetGame", () => {
    io.emit("gameReset");

    if (players.length === 2) {
      currentTurn = players[0];
      io.to(currentTurn).emit("yourTurn");
      io.to(players[1]).emit("waitTurn");
    }
  });

  // 🔹 Handle player disconnect
  socket.on("disconnect", () => {
    console.log("🔴 Player disconnected:", socket.id);
    players = players.filter((id) => id !== socket.id);
    currentTurn = null;
    io.emit("playerLeft");
  });
});

// 🟢 Start Server
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`✅ Server running at: http://localhost:${PORT}`);
});
