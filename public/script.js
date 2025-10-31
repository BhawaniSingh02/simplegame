const socket = io();

const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");
const restartBtn = document.getElementById("restartBtn");

let myTurn = false;
let gameOver = false;

// All winning combinations
const winCombos = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

// ========== SOCKET EVENTS ==========

// When it's your turn
socket.on("yourTurn", () => {
  if (!gameOver) {
    myTurn = true;
    statusText.textContent = "Your turn!";
  }
});

// When waiting
socket.on("waitTurn", () => {
  if (!gameOver) {
    myTurn = false;
    statusText.textContent = "Opponent's turn...";
  }
});

// Room full
socket.on("roomFull", () => {
  alert("Room is full! Please wait for the next match.");
});

// Opponent's move
socket.on("moveMade", (index) => {
  if (index >= 0 && !gameOver) {
    cells[index].textContent = "O";
    cells[index].classList.add("taken", "opponent");
    checkWinner(false); // check opponent's win
    if (!gameOver) {
      myTurn = true;
      statusText.textContent = "Your turn!";
    }
  }
});

// Game reset
socket.on("gameReset", () => {
  resetBoard();
  statusText.textContent = "Game reset! Waiting for turn...";
});

// Opponent left
socket.on("playerLeft", () => {
  alert("Opponent left the game!");
  statusText.textContent = "Waiting for another player...";
  resetBoard();
});

// 🟢 Receive game result from server
socket.on("gameOver", (data) => {
  gameOver = true;
  if (data.winner === "you") {
    statusText.textContent = "🎉 You Win!";
  } else if (data.winner === "opponent") {
    statusText.textContent = "😢 You Lose!";
  } else {
    statusText.textContent = "🤝 It's a Draw!";
  }
});

// ========== GAMEPLAY ==========

// Click on cell
cells.forEach((cell, index) => {
  cell.addEventListener("click", () => {
    if (!myTurn || cell.classList.contains("taken") || gameOver) return;

    cell.textContent = "X";
    cell.classList.add("taken");
    myTurn = false;

    const result = checkWinner(true);
    if (!result) {
      socket.emit("makeMove", index);
      statusText.textContent = "Opponent's turn...";
    }
  });
});

// Restart
restartBtn.addEventListener("click", () => {
  socket.emit("resetGame");
  resetBoard();
});

// ========== FUNCTIONS ==========

function checkWinner(isMyMove) {
  const board = Array.from(cells).map((c) => c.textContent);

  for (let combo of winCombos) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      gameOver = true;
      combo.forEach((i) => cells[i].classList.add("winner"));

      if (isMyMove && board[a] === "X") {
        // Notify server: I won
        socket.emit("gameOver", { winner: "me" });
      }
      return true;
    }
  }

  // Draw
  if (!board.includes("") && !gameOver) {
    gameOver = true;
    socket.emit("gameOver", { winner: "draw" });
    return true;
  }
  return false;
}

function resetBoard() {
  cells.forEach((cell) => {
    cell.textContent = "";
    cell.classList.remove("taken", "opponent", "winner");
  });
  gameOver = false;
}
