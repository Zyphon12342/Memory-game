const socket = io();

const Grid = document.getElementById("Grid");
let lastClickTime = 0;

// Receive update from server
socket.on('gameState', (gameState) => {
    console.log('Received gameState:', gameState);
    updateGrid(gameState);
});

socket.on('flipCard', (cardId) => {
    console.log('Flipping card:', cardId);
    const cardElement = document.querySelector(`[data-id="${cardId}"]`);
    if (cardElement) {
        cardElement.classList.add('flipped');
    }
});

socket.on('unflipCards', (cards) => {
    console.log('Unflipping cards:', cards);
    cards.forEach(cardId => {
        const cardElement = document.querySelector(`[data-id="${cardId}"]`);
        if (cardElement) {
            cardElement.classList.remove('flipped');
        }
    });
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
        cardBack.textContent = card.value;
        cardInner.appendChild(cardFront);
        cardInner.appendChild(cardBack);
        Card.appendChild(cardInner);
        Grid.appendChild(Card);
    });
}

Grid.addEventListener("click", (event) => {
    const now = Date.now();
    if (now - lastClickTime <= 300) return;
    lastClickTime = now;

    const target = event.target.closest(".card");
    if (!target || target.classList.contains("flipped")) return;
    const cardId = parseInt(target.getAttribute("data-id"));
    console.log('Card clicked:', cardId);
    socket.emit('flipCard', cardId);
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
