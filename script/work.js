const Gridsize = 4;
const Grid = document.getElementById("Grid");
let firstCard = null;
let secondCard = null;
let firstCardValue = null;
let secondCardValue = null;
let score = 0;
let lastClickTime = 0;
function generaterand(max) {
    return Math.floor(Math.random() * (max + 1));
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function handleClick(event) { 
    const now = Date.now();
    if (now - lastClickTime <= 300) return; 
    lastClickTime = now;
    const target = event.target.closest(".card");
    if (!target || target.classList.contains("flipped")) return;
    target.classList.add("flipped");
    const value = target.getAttribute("data-value");
    if (!firstCard) {
        firstCard = target;
        firstCardValue = value;
    } 
    else if (!secondCard) {
        secondCard = target;
        secondCardValue = value;
        if (firstCardValue === secondCardValue) {
            score++;
            firstCard = null;
            secondCard = null;
            if (score === (Gridsize * Gridsize) / 2) {
                setTimeout(() => alert("Congratulations! You've matched all pairs!"), 100);
            }
        } 
        else {
            let firstcardloc = firstCard; 
            let secondcardloc = secondCard;
            firstCard = null;
            secondCard = null;
            setTimeout(() => {
                firstcardloc.classList.remove("flipped");
                secondcardloc.classList.remove("flipped");
                firstCard = null;
                secondCard = null;
            }, 300); 
        }
    }
}

function handleHover(event) {
    
    const target = event.target;
    if (target.classList.contains("card-front")) {
        if (event.type === "mouseover") {
            target.style.backgroundColor = "lightblue";
        } 
        else if (event.type === "mouseout") {
            target.style.backgroundColor = "";
        }
    }
}

function CreateGrid(Gridsize) {
    const Squares = Gridsize * Gridsize;
    const half = Math.floor(Squares / 2);
    const set = new Set();
    let i = 1;
    while (set.size !== half) {
        set.add(i++);
    }
    const numbers = [...set, ...set];
    shuffleArray(numbers);
    for (let i = 0; i < Squares; ++i) {
        const Card = document.createElement("div");
        Card.classList.add("card");
        Card.setAttribute("data-value", numbers[i]);
        const cardInner = document.createElement("div");
        cardInner.classList.add("card-inner");
        const cardFront = document.createElement("div");
        cardFront.classList.add("card-front");
        const cardBack = document.createElement("div");
        cardBack.classList.add("card-back");
        cardBack.textContent = numbers[i];
        cardInner.appendChild(cardFront);
        cardInner.appendChild(cardBack);
        Card.appendChild(cardInner);
        Grid.appendChild(Card);
    }
}
Grid.addEventListener("mouseover", handleHover);
Grid.addEventListener("mouseout", handleHover);
Grid.addEventListener("click", handleClick);
CreateGrid(Gridsize);
