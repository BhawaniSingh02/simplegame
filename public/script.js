const socket = io();

const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");
const restartBtn = document.getElementById("restartBtn");

let myTurn = false;
let gameOver = false;

// All winning combinations (indexes)
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

socket.on("yourTurn", () => {
  if (!gameOver) {
    myTurn = true;
    statusText.textContent = "Your turn!";
  }
});

socket.on("waitTurn", () => {
  if (!gameOver) {
    myTurn = false;
    statusText.textContent = "Opponent's turn...";
  }
});

socket.on("roomFull", () => {
  alert("Room is full! Please wait for the next match.");
});

// When opponent makes move
socket.on("moveMade", (index) => {
  if (gameOver) return;

  cells[index].textContent = "O";
  cells[index].classList.add("taken", "opponent");
  myTurn = true;

  checkWinner();
  if (!gameOver) statusText.textContent = "Your turn!";
});

// Reset from server
socket.on("gameReset", () => {
  cells.forEach((cell) => {
    cell.textContent = "";
    cell.classList.remove("taken", "opponent", "winner");
  });
  gameOver = false;
  statusText.textContent = "Game reset! Waiting for turn...";
});

// Player disconnected
socket.on("playerLeft", () => {
  alert("Opponent left the game!");
  statusText.textContent = "Waiting for another player...";
  resetBoard();
});

// Handle player click
cells.forEach((cell, index) => {
  cell.addEventListener("click", () => {
    if (!myTurn || cell.classList.contains("taken") || gameOver) return;

    cell.textContent = "X";
    cell.classList.add("taken");
    myTurn = false;

    checkWinner();
    if (!gameOver) {
      socket.emit("makeMove", index);
      statusText.textContent = "Opponent's turn...";
    }
  });
});

// Restart button
restartBtn.addEventListener("click", () => {
  socket.emit("resetGame");
  resetBoard();
});

// ---- Helper Functions ----

function checkWinner() {
  const board = Array.from(cells).map((c) => c.textContent);
  for (let combo of winCombos) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      gameOver = true;

      // Highlight winner cells
      combo.forEach((i) => cells[i].classList.add("winner"));

      if (board[a] === "X") {
        statusText.textContent = "🎉 You Win!";
        socket.emit("makeMove", -1); // Stop opponent's next move
      } else {
        statusText.textContent = "😢 You Lose!";
      }
      return;
    }
  }

  // Check draw
  if (!board.includes("") && !gameOver) {
    gameOver = true;
    statusText.textContent = "🤝 It's a Draw!";
  }
}

function resetBoard() {
  cells.forEach((cell) => {
    cell.textContent = "";
    cell.classList.remove("taken", "opponent", "winner");
  });
  gameOver = false;
}
