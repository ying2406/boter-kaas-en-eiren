// node.js met/en socket.io
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Statische bestanden bedienen (HTML, CSS, JS)
app.use(express.static('public'));

// Verbindingen met de client
io.on('connection', (socket) => {
    console.log('Een speler is verbonden');

    // Ontvang chatberichten
    socket.on('chatMessage', (message) => {
        io.emit('chatMessage', message); // Zend het bericht naar alle spelers
    });

    // Ontvang gekozen woord
    socket.on('wordChosen', (word) => {
        console.log(`Woord gekozen: ${word}`);
        // Hier kun je de logica toevoegen om het gekozen woord naar andere spelers te sturen
    });

    // Verbind een speler
    socket.on('disconnect', () => {
        console.log('Een speler is gedisconnect');
    });
});

// Start de server
server.listen(3000, () => {
    console.log('Server draait op http://localhost:3000');
});
