document.addEventListener('DOMContentLoaded', () => {
    const offlineModeButton = document.getElementById("offline-mode");
    const onlineModeButton = document.getElementById("online-mode");
    const modeSelection = document.getElementById("mode-selection");
    const startGameButton = document.getElementById("start-game");
    const resetButton = document.getElementById("reset");

    let isOnlineMode = false;
    let currentPlayer = "X";
    let board = ["", "", "", "", "", "", "", "", ""];
    let isGameActive = true;
    let player1Name = "Speler 1";
    let player2Name = "Speler 2";
    let socket = io();  // Maak verbinding met de server via WebSockets

    socket.on('connect', () => {
        console.log('Verbonden met de server via socket');
    });

    startGameButton.addEventListener("click", () => {
        const player1Input = document.getElementById("player1-name");
        const player2Input = document.getElementById("player2-name");

        player1Name = player1Input.value || "Speler 1";
        player2Name = player2Input.value || "Speler 2";

        modeSelection.classList.remove("hidden");
        document.getElementById("player-form").classList.add("hidden");
    });

    offlineModeButton.addEventListener("click", () => {
        isOnlineMode = false;
        startGame();
    });

    onlineModeButton.addEventListener("click", () => {
        isOnlineMode = true;
        startGame();
    });

    function startGame() {
        const scorePlayer1 = document.getElementById("score-player1");
        const scorePlayer2 = document.getElementById("score-player2");
        const gameContainer = document.getElementById("game-container");
        const statusText = document.getElementById("status");

        scorePlayer1.textContent = `${player1Name} (X): 0`;
        scorePlayer2.textContent = `${player2Name} (O): 0`;

        gameContainer.classList.remove("hidden");
        modeSelection.classList.add("hidden");

        statusText.textContent = `${player1Name} (X) is aan de beurt.`;

        if (isOnlineMode) {
            initializeOnlineGame();
        } else {
            initializeOfflineGame();
        }
    }

    function initializeOfflineGame() {
        const cells = document.querySelectorAll(".cell");
        currentPlayer = "X";
        board = ["", "", "", "", "", "", "", "", ""];
        isGameActive = true;

        cells.forEach((cell, index) => {
            cell.textContent = "";
            cell.className = "cell";
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

    function checkWinner() {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        return winPatterns.some(pattern => 
            pattern.every(index => board[index] === currentPlayer)
        );
    }

    socket.on('game-started', () => {
        console.log("Het spel is gestart!");
    });

    socket.on('move-made', (data) => {
        board = data.board;
        currentPlayer = data.currentPlayer;
        updateBoard();
    });

    socket.on('game-over', (data) => {
        if (data.winner) {
            document.getElementById("status").textContent = `Speler ${data.winner} wint!`;
        } else {
            document.getElementById("status").textContent = "Gelijkspel!";
        }
        isGameActive = false;
    });

    socket.on('game-reset', (data) => {
        board = data.board;
        currentPlayer = data.currentPlayer;
        updateBoard();
        document.getElementById("status").textContent = `Het is de beurt van speler ${currentPlayer}.`;
    });

    socket.on('update-score', (score) => {
        document.getElementById("score-player1").textContent = `${player1Name} (X): ${score.player1Score}`;
        document.getElementById("score-player2").textContent = `${player2Name} (O): ${score.player2Score}`;
    });

    function updateBoard() {
        const cells = document.querySelectorAll(".cell");
        cells.forEach((cell, index) => {
            cell.textContent = board[index];
        });
    }

    resetButton.addEventListener("click", () => {
        if (isOnlineMode) {
            socket.emit('reset-game');
        } else {
            initializeOfflineGame();
        }
    });
});
