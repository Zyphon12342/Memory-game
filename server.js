import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = 3000;

// Serve static files from the current directory
app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Game state
let gameState = {
  gridSize: 4,
  cards: [],
  firstCard: null,
  secondCard: null,
  firstCardValue: null,
  secondCardValue: null,
  score: 0,
  lastClickTime: 0
};

// Randomize function
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Initialize game state
function createGameState(gridSize) {
  const squares = gridSize * gridSize;
  const half = Math.floor(squares / 2);
  const set = new Set();
  let i = 1;
  while (set.size !== half) {
    set.add(i++);
  }
  const numbers = [...set, ...set];
  shuffleArray(numbers);
  return {
    gridSize,
    cards: numbers.map((num, index) => ({ id: index, value: num, flipped: false })),
    firstCard: null,
    secondCard: null,
    firstCardValue: null,
    secondCardValue: null,
    score: 0,
    lastClickTime: 0
  };
}

gameState = createGameState(gameState.gridSize);

io.on('connection', (socket) => {
  socket.emit('gameState', gameState);

  socket.on('flipCard', (cardId) => {
    const now = Date.now();
    if (now - gameState.lastClickTime <= 300) return;
    gameState.lastClickTime = now;

    const card = gameState.cards.find(c => c.id === cardId);
    if (!card || card.flipped) return;
    card.flipped = true;
    io.emit('flipCard', cardId); // Broadcast the flip action to all clients

    if (!gameState.firstCard) {
      gameState.firstCard = card;
      gameState.firstCardValue = card.value;
    } else if (!gameState.secondCard) {
      gameState.secondCard = card;
      gameState.secondCardValue = card.value;
      if (gameState.firstCardValue === gameState.secondCardValue) {
        gameState.score++;
        gameState.firstCard = null;
        gameState.secondCard = null;
        if (gameState.score === (gameState.gridSize * gameState.gridSize) / 2) {
          setTimeout(() => io.emit('gameEnd', gameState), 100);
        }
      } else {
        const firstCardId = gameState.firstCard.id;
        const secondCardId = gameState.secondCard.id;
        gameState.firstCard = null;
        gameState.secondCard = null;
        setTimeout(() => {
          gameState.cards.find(c => c.id === firstCardId).flipped = false;
          gameState.cards.find(c => c.id === secondCardId).flipped = false;
          io.emit('unflipCards', [firstCardId, secondCardId]);
        }, 300); // Adjusted delay to 1 second for better visibility of the flip
      }
    }
    io.emit('gameState', gameState);
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
