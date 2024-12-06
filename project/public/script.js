const offlineModeButton = document.getElementById("offline-mode");
const onlineModeButton = document.getElementById("online-mode");
const modeSelection = document.getElementById("mode-selection");

let isOnlineMode = false; // Flag to check if the game is online or offline

// Toggle between offline and online mode
offlineModeButton.addEventListener("click", () => {
    isOnlineMode = false;
    startGame();
});

onlineModeButton.addEventListener("click", () => {
    isOnlineMode = true;
    startGame();
});

// Function to start the game after selecting a mode
function startGame() {
    player1Name = player1Input.value || "Speler 1";
    player2Name = player2Input.value || "Speler 2";

    scorePlayer1.textContent = `${player1Name} (X): ${player1Score}`;
    scorePlayer2.textContent = `${player2Name} (O): ${player2Score}`;

    modeSelection.classList.add("hidden");
    playerForm.classList.add("hidden");
    gameContainer.classList.remove("hidden");
    statusText.textContent = `${player1Name} (X) is aan de beurt.`;

    if (isOnlineMode) {
        initializeOnlineGame();  // Initialize multiplayer logic
    } else {
        initializeOfflineGame(); // Initialize offline gameplay
    }
}

// Offline Game Logic
function initializeOfflineGame() {
    currentPlayer = "X";
    board = ["", "", "", "", "", "", "", "", ""];
    isGameActive = true;
    cells.forEach(cell => cell.addEventListener("click", handleCellClick));
}

// Multiplayer Game Logic (with Socket.IO)
function initializeOnlineGame() {
    const socket = io();
    let player = null;
    let board = [];
    let currentPlayer = "X";

    function renderBoard() {
        cells.forEach((cell, index) => {
            cell.textContent = board[index];
            cell.className = "cell " + (board[index] ? "taken" : "");
        });
    }

    function handleCellClick(event) {
        const index = event.target.getAttribute("data-index");
        if (player && board[index] === "" && currentPlayer === player) {
            socket.emit("make-move", { index });
        }
    }

    cells.forEach(cell => cell.addEventListener("click", handleCellClick));

    socket.on("player-assigned", (data) => {
        player = data.player;
        board = data.board;
        statusText.textContent = `Je bent speler ${player}. Wacht op de andere speler...`;
        renderBoard();
    });

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
}

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
