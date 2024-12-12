const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let players = [];
let gameBoard = ["", "", "", "", "", "", "", "", ""];
let player1Score = 0;
let player2Score = 0;

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('Een speler is verbonden');

    if (players.length < 2) {
        players.push(socket);
        socket.emit('player-assigned', { player: players.length === 1 ? 'X' : 'O', board: gameBoard });

        if (players.length === 2) {
            io.emit('game-started');
        }
    } else {
        socket.emit('game-full');
    }

    socket.on('make-move', (data) => {
        const { index, player } = data;

        if (gameBoard[index] === "") {
            gameBoard[index] = player;
            io.emit('move-made', { board: gameBoard, currentPlayer: player === 'X' ? 'O' : 'X' });

            if (checkWinner(player)) {
                io.emit('game-over', { winner: player, board: gameBoard });
                updateScore(player);
                gameBoard = ["", "", "", "", "", "", "", "", ""];
                io.emit('game-reset', { board: gameBoard, currentPlayer: 'X' });
            } else if (gameBoard.every(cell => cell !== "")) {
                io.emit('game-over', { winner: null, board: gameBoard });
                gameBoard = ["", "", "", "", "", "", "", "", ""];
                io.emit('game-reset', { board: gameBoard, currentPlayer: 'X' });
            }
        }
    });

    socket.on('reset-game', () => {
        gameBoard = ["", "", "", "", "", "", "", "", ""];
        io.emit('game-reset', { board: gameBoard, currentPlayer: 'X' });
    });

    socket.on('disconnect', () => {
        console.log('Een speler is disconnected');
        players = players.filter(player => player !== socket);

        if (players.length === 0) {
            gameBoard = ["", "", "", "", "", "", "", "", ""];
            io.emit('game-reset', { board: gameBoard, currentPlayer: 'X' });
        } else if (players.length === 1) {
            io.emit('player-disconnected');
            gameBoard = ["", "", "", "", "", "", "", "", ""];
        }
    });
});

function checkWinner(player) {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    return winPatterns.some(pattern => 
        pattern.every(index => gameBoard[index] === player)
    );
}

function updateScore(player) {
    if (player === 'X') {
        player1Score++;
    } else if (player === 'O') {
        player2Score++;
    }
    io.emit('update-score', { player1Score, player2Score });
}

server.listen(3000, () => {
    console.log('Server draait op http://localhost:3000');
});
