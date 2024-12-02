// Elementen selecteren
const playerForm = document.getElementById("player-form");
const player1Input = document.getElementById("player1-name");
const player2Input = document.getElementById("player2-name");
const startGameButton = document.getElementById("start-game");
const gameContainer = document.getElementById("game-container");
const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");
const resetButton = document.getElementById("reset");
const scorePlayer1 = document.getElementById("score-player1");
const scorePlayer2 = document.getElementById("score-player2");

let currentPlayer = "X";
let board = ["", "", "", "", "", "", "", "", ""];
let isGameActive = true;
let player1Score = 0;
let player2Score = 0;
let player1Name = "Speler 1";
let player2Name = "Speler 2";

const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
];

// Functie om namen in te stellen en het spel te starten
startGameButton.addEventListener("click", () => {
    player1Name = player1Input.value || "Speler 1";
    player2Name = player2Input.value || "Speler 2";

    scorePlayer1.textContent = `${player1Name} (X): ${player1Score}`;
    scorePlayer2.textContent = `${player2Name} (O): ${player2Score}`;

    playerForm.classList.add("hidden");
    gameContainer.classList.remove("hidden");
    statusText.textContent = `${player1Name} (X) is aan de beurt.`;
});

function handleCellClick(event) {
    const cell = event.target;
    const index = cell.getAttribute("data-index");

    if (board[index] !== "" || !isGameActive) return;

    board[index] = currentPlayer;
    cell.textContent = currentPlayer;
    cell.classList.add("taken");

    if (checkWin()) {
        if (currentPlayer === "X") {
            player1Score++;
            scorePlayer1.textContent = `${player1Name} (X): ${player1Score}`;
        } else {
            player2Score++;
            scorePlayer2.textContent = `${player2Name} (O): ${player2Score}`;
        }
        statusText.textContent = `Gefeliciteerd! ${currentPlayer === "X" ? player1Name : player2Name} heeft gewonnen!`;
        isGameActive = false;
