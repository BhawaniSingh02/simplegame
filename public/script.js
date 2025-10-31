const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");
const restartBtn = document.getElementById("restartBtn");

let currentPlayer = "X";
let gameOver = false;
let board = ["", "", "", "", "", "", "", "", ""];

const winConditions = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

initializeGame();

function initializeGame() {
  cells.forEach((cell, index) => {
    cell.addEventListener("click", () => handleCellClick(index));
  });
  restartBtn.addEventListener("click", restartGame);
  updateStatus(`Player ${currentPlayer}'s Turn`);
}

function handleCellClick(index) {
  if (board[index] !== "" || gameOver) return;

  board[index] = currentPlayer;
  cells[index].textContent = currentPlayer;

  if (checkWinner()) {
    updateStatus(`🎉 Player ${currentPlayer} Wins!`);
    gameOver = true;
    return;
  }

  if (board.every(cell => cell !== "")) {
    updateStatus("🤝 It's a Draw!");
    gameOver = true;
    return;
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  updateStatus(`Player ${currentPlayer}'s Turn`);
}

function checkWinner() {
  for (let condition of winConditions) {
    const [a, b, c] = condition;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      highlightWinningCells(condition);
      return true;
    }
  }
  return false;
}

function highlightWinningCells(condition) {
  condition.forEach(index => {
    cells[index].style.backgroundColor = "#00C49A";
  });
}

function restartGame() {
  board = ["", "", "", "", "", "", "", "", ""];
  currentPlayer = "X";
  gameOver = false;
  cells.forEach(cell => {
    cell.textContent = "";
    cell.style.backgroundColor = "";
  });
  updateStatus(`Player ${currentPlayer}'s Turn`);
}

function updateStatus(message) {
  statusText.textContent = message;
}
