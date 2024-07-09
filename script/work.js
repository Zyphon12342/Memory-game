const socket = io();

const Grid = document.getElementById("Grid");
const scoreElement = document.getElementById("score");
const restartButton = document.getElementById("restartButton");
let lastClickTime = 0;

restartButton.addEventListener("click", () => {
    socket.emit('restartGame');
});

socket.on('gameState', (gameState) => {
    console.log('Received gameState:', gameState);
    updateGrid(gameState);
    updateScore(gameState.score);
});

socket.on('flipCard', (cardId) => {
    console.log('Flipping card:', cardId);
    setTimeout(() => {
        const cardElement = document.querySelector(`[data-id="${cardId}"]`);
        if (cardElement) {
            cardElement.classList.add('flipped');
        }
    }, 100);
});

socket.on('unflipCards', (cards) => {
    console.log('Unflipping cards:', cards);
    setTimeout(() => {
        cards.forEach(cardId => {
            const cardElement = document.querySelector(`[data-id="${cardId}"]`);
            if (cardElement) {
                cardElement.classList.remove('flipped');
            }
        });
    }, 100); // Adjust the timeout as needed for the cards to visibly flip back
});

socket.on('gameEnd', (gameState) => {
    alert("Congratulations! You've matched all pairs!");
    updateGrid(gameState);
});

function updateGrid(gameState) {
    Grid.innerHTML = '';
    gameState.cards.forEach(card => {
        const Card = document.createElement("div");
        Card.classList.add("card");
        if (card.flipped) {
            Card.classList.add("flipped");
        }
        Card.setAttribute("data-id", card.id);
        const cardInner = document.createElement("div");
        cardInner.classList.add("card-inner");
        const cardFront = document.createElement("div");
        cardFront.classList.add("card-front");
        const cardBack = document.createElement("div");
        cardBack.classList.add("card-back");
        
        const img = document.createElement("img");
        img.src = `img/${card.value}.jpg`; // Adjust image path based on your project structure
        img.alt = `Image ${card.value}`;
        cardBack.appendChild(img);

        cardInner.appendChild(cardFront);
        cardInner.appendChild(cardBack);
        Card.appendChild(cardInner);
        Grid.appendChild(Card);
    });
}

function updateScore(score) {
    scoreElement.textContent = `Score: ${score}`;
}

Grid.addEventListener("click", (event) => {
    const target = event.target.closest(".card");
    if (!target || target.classList.contains("flipped")) return;
    const cardId = parseInt(target.getAttribute("data-id"));
    console.log('Card clicked:', cardId);
    handleCardClick(cardId);
});

// Handle touch events for mobile devices
Grid.addEventListener("touchstart", (event) => {
    const target = event.target.closest(".card");
    if (!target || target.classList.contains("flipped")) return;
    const cardId = parseInt(target.getAttribute("data-id"));
    console.log('Card touched:', cardId);
    handleCardClick(cardId);
});

Grid.addEventListener("mouseover", handleHover);
Grid.addEventListener("mouseout", handleHover);

function handleHover(event) {
    const target = event.target;
    if (target.classList.contains("card-front")) {
        if (event.type === "mouseover") {
            target.style.backgroundColor = "lightblue";
        } else if (event.type === "mouseout") {
            target.style.backgroundColor = "";
        }
    }
}

function handleCardClick(cardId) {
    const now = Date.now();
    if (now - lastClickTime <= 300) return;
    lastClickTime = now;
    socket.emit('flipCard', cardId);
}