document.addEventListener("DOMContentLoaded", () => {
    const modeButtons = document.querySelectorAll("#offline-mode, #online-mode");
    const startGameButton = document.getElementById("start-game");
    const resetButton = document.getElementById("reset");
    const cells = document.querySelectorAll(".cell");
    const statusText = document.getElementById("status");
    let isOnlineMode = false;
    let currentPlayer = "X";
    let board = Array(9).fill("");
    let isGameActive = true;
    let playerNames = { X: "Speler 1", O: "Speler 2" };
    let scores = { X: 0, O: 0 };

    let socket = null;

    try {
        socket = io("http://localhost:5500");
        socket.on("connect_error", (err) => console.error("Socket connection error:", err.message));
    } catch (error) {
        console.error("Failed to initialize Socket.IO:", error.message);
        socket = null;
    }

    startGameButton.addEventListener("click", () => {
        playerNames.X = document.getElementById("player1-name").value || "Speler 1";
        const player2NameInput = document.getElementById("player2-name").value;

        if (isOnlineMode) {
            playerNames.O = "Jett"; // In online-modus wordt de standaardnaam "Jett" gebruikt
            playerNames.O = "Jett"; 
        } else {
            playerNames.O = player2NameInput || "Speler 2"; // In offline-modus wordt de ingevoerde naam of "Bot" gebruikt
            playerNames.O = player2NameInput || "Speler 2"; 
        }

        updateScore();

        toggleVisibility("#player-form", false);
        toggleVisibility("#mode-selection", true);
    });

    modeButtons.forEach((button) =>
        button.addEventListener("click", () => {
            isOnlineMode = button.id === "online-mode";
            startGame();
        })
    );

    resetButton.addEventListener("click", () => {
        if (isOnlineMode && socket) socket.emit("reset-game");
        else resetGame();
    });

    const startGame = () => {
        updateScore();
        toggleVisibility("#game-container", true);
        toggleVisibility("#mode-selection", false);
        resetGame();
        if (isOnlineMode && socket) initializeOnlineMode();
    };

    const resetGame = () => {
        board.fill("");
        isGameActive = true;
        currentPlayer = "X";
        statusText.textContent = `Het is de beurt van ${playerNames[currentPlayer]}.`;
        cells.forEach((cell, idx) => {
            cell.textContent = "";
            cell.onclick = () => handleCellClick(idx);
        });
    };

    const handleCellClick = (index) => {
        if (!isGameActive || board[index]) return;
        board[index] = currentPlayer;
        cells[index].textContent = currentPlayer;

        if (checkWinner()) endGame(`${playerNames[currentPlayer]} wint!`);
        else if (board.every(Boolean)) endGame("Gelijkspel!");
        else switchPlayer();
    };

    const switchPlayer = () => {
        currentPlayer = currentPlayer === "X" ? "O" : "X";
        statusText.textContent = `Het is de beurt van ${playerNames[currentPlayer]}.`;

        if (currentPlayer === "O" && isOnlineMode) {
            setTimeout(botMove, 500);
        }
    };

    const botMove = () => {
        let availableMoves = board.map((val, idx) => (val === "" ? idx : null)).filter(val => val !== null);
        let move = availableMoves[Math.floor(Math.random() * availableMoves.length)];
        board[move] = "O";
        cells[move].textContent = "O";

        if (checkWinner()) endGame(`${playerNames["O"]} wint!`);
        else if (board.every(Boolean)) endGame("Gelijkspel!");
        else switchPlayer();
    };

    const checkWinner = () => {
        const patterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];
        return patterns.some((pattern) =>
            pattern.every((idx) => board[idx] === currentPlayer)
        );
    };

    const endGame = (message) => {
        isGameActive = false;
        statusText.textContent = message;

        if (message.includes("wint")) {
            scores[currentPlayer]++;
            updateScore();
        }
    };

    const updateScore = () => {
        document.getElementById("score-player1").textContent = `${playerNames.X} (X): ${scores.X}`;
        document.getElementById("score-player2").textContent = `${playerNames.O} (O): ${scores.O}`;
    };

    const initializeOnlineMode = () => {
        if (!socket) {
            console.error("Socket.IO is not initialized. Online mode cannot be started.");
            return;
        }

        socket.on("move-made", ({ board: newBoard, currentPlayer: nextPlayer }) => {
            board = newBoard;
            currentPlayer = nextPlayer;
            updateBoard();
        });

        socket.on("game-over", ({ winner }) => {
            if (winner) endGame(`${playerNames[winner]} wint!`);
            else endGame("Gelijkspel!");
        });

        socket.on("game-reset", resetGame);
    };

    const updateBoard = () => {
        cells.forEach((cell, idx) => {
            cell.textContent = board[idx];
        });
    };

    const toggleVisibility = (selector, show) => {
        document.querySelector(selector).classList.toggle("hidden", !show);
    };
});
