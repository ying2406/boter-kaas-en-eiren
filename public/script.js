// Verbinding maken met de server
const socket = io();

// Variabele voor het canvas en tekenen
const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
let isDrawing = false;
let lastX = 0;
let lastY = 0;

// Tekenen op het canvas
canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    lastX = e.offsetX;
    lastY = e.offsetY;
});

canvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;
    const currentX = e.offsetX;
    const currentY = e.offsetY;
    
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(currentX, currentY);
    ctx.stroke();
    
    lastX = currentX;
    lastY = currentY;
});

canvas.addEventListener('mouseup', () => {
    isDrawing = false;
});

// Verstuur een bericht naar de server
function sendMessage() {
    const message = document.getElementById('chatInput').value;
    socket.emit('chatMessage', message); // Verstuur bericht naar server
    document.getElementById('chatInput').value = ''; // Maak input leeg
}

// Ontvang berichten van de server
socket.on('chatMessage', (message) => {
    const li = document.createElement('li');
    li.textContent = message;
    document.getElementById('chatMessages').appendChild(li);
});

// Kies een woord om te tekenen
function chooseWord(word) {
    socket.emit('wordChosen', word); // Verstuur gekozen woord naar server
}
