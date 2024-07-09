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
const PORT = 42164;

app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

let gameState = createGameState(4); // Initial game state

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

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  socket.emit('gameState', gameState); // Initial game state when user connects

  socket.on('flipCard', (cardId) => {
    const now = Date.now();
    gameState.lastClickTime = now;

    const card = gameState.cards.find(c => c.id === cardId);
    if (!card || card.flipped) return;

    card.flipped = true;
    io.emit('flipCard', cardId); // Broadcast the flipped card to all clients

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
        // Invalid pair found, handle unflipping after a short delay
        setTimeout(() => {
          const firstCardId = gameState.firstCard.id;
          const secondCardId = gameState.secondCard.id;
          gameState.cards.find(c => c.id === firstCardId).flipped = false;
          gameState.cards.find(c => c.id === secondCardId).flipped = false;
          io.emit('unflipCards', [firstCardId, secondCardId]);
          gameState.firstCard = null;
          gameState.secondCard = null;
        }, 200); // Adjust the timeout as needed for the cards to visibly flip back
      }
    }
    io.emit('gameState', gameState); // Broadcast updated game state to all clients
  });

  socket.on('restartGame', () => {
    gameState = createGameState(4); // Restart the game with a new state
    io.emit('gameState', gameState); // Broadcast new game state to all clients
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});