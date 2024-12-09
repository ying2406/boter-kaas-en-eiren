const offlineModeButton = document.getElementById("offline-mode");
const onlineModeButton = document.getElementById("online-mode");
const modeSelection = document.getElementById("mode-selection");
const startGameButton = document.getElementById("start-game");
const resetButton = document.getElementById("reset")

// Globale variabelen
let isOnlineMode = false; // Zorg ervoor dat dit globaal is
let currentPlayer = "X";
let board = ["", "", "", "", "", "", "", "", ""];
let isGameActive = true;


// Startknop event
startGameButton.addEventListener("click", () => {
    console.log("Start Spel Knop Geklikt!");

let isOnlineMode = false; 
});

// Toggle between offline and online mode
offlineModeButton.addEventListener("click", () => {
    isOnlineMode = false;
    startGame();
});

onlineModeButton.addEventListener("click", () => {
    isOnlineMode = true;
    startGame();
});

// Function to Spel starten na mode-selectie
    function startGame() {
        const player1Input = document.getElementById("player1-name");
        const player2Input = document.getElementById("player2-name");
        const scorePlayer1 = document.getElementById("score-player1");
        const scorePlayer2 = document.getElementById("score-player2");
        const playerForm = document.getElementById("player-form");
        const gameContainer = document.getElementById("game-container");
        const statusText = document.getElementById("status");
    
        let player1Name = player1Input.value || "Speler 1";
        let player2Name = player2Input.value || "Speler 2";
    
        let player1Score = 0;
        let player2Score = 0;
    
        scorePlayer1.textContent = `${player1Name} (X): ${player1Score}`;
        scorePlayer2.textContent = `${player2Name} (O): ${player2Score}`;
    
        modeSelection.classList.add("hidden");
        playerForm.classList.add("hidden");
        gameContainer.classList.remove("hidden");
        statusText.textContent = `${player1Name} (X) is aan de beurt.`;
    
        if (isOnlineMode) {
            initializeOnlineGame(); // Multiplayer logica
        } else {
            initializeOfflineGame(); // Offline logica
        }
    }

// Offline Game Logic
function initializeOfflineGame() {
    const cells = document.querySelectorAll(".cell");
    currentPlayer = "X";
    board = ["", "", "", "", "", "", "", "", ""];
    isGameActive = true;
    
    cells.forEach((cell, index) => {
        cell.textContent = "";
        cell.className = "cell"; // Reset de cell
        cell.addEventListener("click", () => handleCellClick(index, cell));
    });
}

function handleCellClick(index, cell) {
    if (!isGameActive || board[index] !== "") return;

    board[index] = currentPlayer;
    cell.textContent = currentPlayer;

    if (checkWinner()) {
        document.getElementById("status").textContent = `Speler ${currentPlayer} wint!`;
        isGameActive = false;
        return;
    }

    if (board.every(cell => cell !== "")) {
        document.getElementById("status").textContent = "Gelijkspel!";
        isGameActive = false;
        return;
    }

    currentPlayer = currentPlayer === "X" ? "O" : "X";
    document.getElementById("status").textContent = `Het is de beurt van speler ${currentPlayer}.`;
}


// Controle op winnaar
function checkWinner() {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rijen
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Kolommen
        [0, 4, 8], [2, 4, 6],           // Diagonalen
    ];

    return winPatterns.some(pattern =>
        pattern.every(index => board[index] === currentPlayer)
    );
}

// Multiplayer Game Logic (with Socket.IO)
function initializeOnlineGame() {
    const cells = document.querySelectorAll(".cell");
    const socket = io();
    let player = null;
    
    socket.on("player-assigned", data => {
        player = data.player;
        board = data.board;
        document.getElementById("status").textContent = `Je bent speler ${player}.`;
        renderBoard();
    });

    socket.on("move-made", data => {
        board = data.board;
        currentPlayer = data.currentPlayer;
        renderBoard();
    });

    function renderBoard() {
        cells.forEach((cell, index) => {
            cell.textContent = board[index];
        });
    }

    cells.forEach((cell, index) => {
        cell.addEventListener("click", () => {
            if (player === currentPlayer && board[index] === "") {
                socket.emit("make-move", { index });
            }
        });
    });
}


    socket.on("game-started", () => {
        statusText.textContent = `Het spel is begonnen! Speler X begint.`;
    });

    socket.on("move-made", (data) => {
        board = data.board;
        currentPlayer = data.currentPlayer;
        renderBoard();
        statusText.textContent = `Het is de beurt van speler ${currentPlayer}.`;
    });

    socket.on("player-disconnected", () => {
        statusText.textContent = "Een speler heeft de verbinding verbroken. Wacht op een nieuwe speler...";
        board = ["", "", "", "", "", "", "", "", ""];
        renderBoard();
    });

    socket.on("game-full", () => {
        statusText.textContent = "Het spel is vol. Probeer later opnieuw.";
    });


resetButton.addEventListener("click", () => {
    if (isOnlineMode) {
        // Implement multiplayer reset logic here
    } else {
        board = ["", "", "", "", "", "", "", "", ""];
        currentPlayer = "X";
        isGameActive = true;
        cells.forEach(cell => cell.textContent = "");
        statusText.textContent = `${player1Name} (X) is aan de beurt.`;
    }
});

