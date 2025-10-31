const socket = io();

const cells = document.querySelectorAll('.cell');
const statusText = document.getElementById('status');
const resetBtn = document.getElementById('resetBtn');

let myTurn = true; // player 1 starts
let currentPlayer = 'X';
let boardState = ["", "", "", "", "", "", "", "", ""];
let gameActive = true;

const winningCombos = [
  [0,1,2], [3,4,5], [6,7,8],
  [0,3,6], [1,4,7], [2,5,8],
  [0,4,8], [2,4,6]
];

cells.forEach(cell => {
  cell.addEventListener('click', () => {
    const index = cell.dataset.index;

    if (!myTurn || boardState[index] || !gameActive) return;

    makeMove(index, currentPlayer);
    socket.emit('makeMove', { index, player: currentPlayer });
  });
});

function makeMove(index, player) {
  boardState[index] = player;
  cells[index].textContent = player;
  checkWinner();

  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  myTurn = !myTurn;
  statusText.textContent = myTurn ? "Your Turn" : "Friend's Turn";
}

function checkWinner() {
  for (let combo of winningCombos) {
    const [a, b, c] = combo;
    if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
      gameActive = false;
      statusText.textContent = `🎉 Player ${boardState[a]} wins!`;
      [a, b, c].forEach(i => cells[i].style.background = "#90e0ef");
      return;
    }
  }

  if (!boardState.includes("")) {
    statusText.textContent = "It's a draw 😅";
    gameActive = false;
  }
}

resetBtn.addEventListener('click', () => {
  socket.emit('resetGame');
  resetGame();
});

socket.on('moveMade', (data) => {
  makeMove(data.index, data.player);
});

socket.on('gameReset', resetGame);

function resetGame() {
  boardState = ["", "", "", "", "", "", "", "", ""];
  gameActive = true;
  currentPlayer = 'X';
  myTurn = true;
  statusText.textContent = "Your Turn";
  cells.forEach(c => {
    c.textContent = "";
    c.style.background = "white";
  });
}
