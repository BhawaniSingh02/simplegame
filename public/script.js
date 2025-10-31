const socket = io();

const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");
const restartBtn = document.getElementById("restartBtn");

let myTurn = false;
let gameOver = false;

// Handle turn messages
socket.on("yourTurn", () => {
  myTurn = true;
  statusText.textContent = "Your turn!";
});

socket.on("waitTurn", () => {
  myTurn = false;
  statusText.textContent = "Opponent's turn...";
});

// Handle room full
socket.on("roomFull", () => {
  alert("Room is full! Please wait for the next match.");
});

// Handle opponent move
socket.on("moveMade", (index) => {
  cells[index].classList.add("taken", "opponent");
  cells[index].textContent = "O";
  myTurn = true;
  statusText.textContent = "Your turn!";
});

// Handle reset
socket.on("gameReset", () => {
  cells.forEach(cell => {
    cell.textContent = "";
    cell.classList.remove("taken", "opponent");
  });
  statusText.textContent = "Game reset! Waiting for turn...";
  gameOver = false;
});

// Player left
socket.on("playerLeft", () => {
  alert("Opponent left the game!");
  statusText.textContent = "Waiting for another player...";
});

// Make move
cells.forEach((cell, index) => {
  cell.addEventListener("click", () => {
    if (!myTurn || cell.classList.contains("taken") || gameOver) return;

    cell.textContent = "X";
    cell.classList.add("taken");
    myTurn = false;
    socket.emit("makeMove", index);
    statusText.textContent = "Opponent's turn...";
  });
});

// Reset button
restartBtn.addEventListener("click", () => {
  socket.emit("resetGame");
});
