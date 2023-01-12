

const suitDisplays = {"c": "♣", "s": "♠", "h": "♥", "d": "♦"};
const suitColors = {"c": "black", "s": "black", "h": "red", "d": "red"};
const valueDisplays = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

let spriteURLs = new Map();
[["Diamonds", "d"], ["Hearts", "h"], ["Spades", "s"], ["Clubs", "c"]].forEach(suit => {
    valueDisplays.forEach(val => {
        let url = "sprites/card" + suit[0] + val + ".png";
        let key = val + suit[1];
        spriteURLs.set(key, url); 
    })
});

function Card(value, suit) {
    // value 0 to 12 (0 is two, 12 is ace)
    this.value = value;
    // suits: clubs - c, spades - s, hearts - h, diamonds -d
    this.suit = suit; 
}

Card.prototype.canPlaceOn = function(card) {
    // make sure the card colors are opposites
    // make sure that the difference between the card we are trying to place on and this card is exactly 1
    return suitColors[this.suit] != suitColors[card.suit] && card.value - this.value == 1;
}

Card.prototype.canPlaceOnFoundation = function(foundation) {
    if (foundation.length == 0) 
        return this.value == 0;
    let top = foundation[foundation.length - 1];
    return this.suit == top.suit && this.value == top.value + 1;
}

Card.prototype.toString = function() {
    return valueDisplays[this.value] + suitDisplays[this.suit];
}

Card.prototype.makeCard = function() {
    let card = document.createElement("div");
    card.classList.add("card")
    card.style.backgroundImage = "url(" + spriteURLs.get(valueDisplays[this.value] + this.suit) + ")";
    return card;
}

function makeHiddenCard() {
    let card = document.createElement("div");
    card.classList.add("hidden");
    card.classList.add("card");
    return card;
}

function makeSlotCard() {
    let card = document.createElement("div");
    card.classList.add("slot");
    card.classList.add("card");
    return card;
}

function Deck() {
    this.cards = [];
    // add all 52 cards to the deck
    ['c','s','d','h'].forEach(suit => {
        for (let i = 0; i < 13; i++) {
            this.cards.push(new Card(i, suit));
        }
    });
}

Deck.prototype.shuffle = function() {
    // randomizes the cards in the deck
    for (let i = 0; i < 100; i++) {
        // select two random indices and swap the cards at those indices
        let i1 = Math.floor(Math.random() * 52), i2 = Math.floor(Math.random() * 52);
        let temp = this.cards[i1];
        this.cards[i1] = this.cards[i2];
        this.cards[i2] = temp;
    }
}

Deck.prototype.draw = function() {
    let c = this.cards[0];
    this.cards.splice(0, 1);
    return c;
}

function Solitaire() {
    this.deck = new Deck();
    this.deck.shuffle();
    this.deckIndex = -1;
    this.stacks = [];
    this.clickedCards = [];
    this.clickedCardsOrigin = "none";
    for (let i = 0; i < 7; i++) {
        let stack = {index: i, cards: []};
        for (let j = 0; j <= i; j++) {
            stack.cards.push(this.deck.draw());
        }
        this.stacks.push(stack);
    }

    this.fullStacks = [[],[],[],[]];
}

Solitaire.prototype.drawCard = function() {
    if (this.deckIndex < this.deck.cards.length - 1) {
        this.deckIndex++;
    }
    else {
        this.deckIndex = -1;
    }
    this.setDocument();
}

Solitaire.prototype.setDocument = function() {
    

    let drawstack = document.getElementById("drawstack");
    drawstack.innerHTML = "";
    if (this.deckIndex < this.deck.cards.length - 1) {
        let draw = makeHiddenCard();
        draw.addEventListener("click", () => {
            this.deckIndex++;
            this.clickedCards = [];
            this.setDocument();
        });
        drawstack.appendChild(draw);
    }
    else {
        let slot = makeSlotCard();
        slot.addEventListener("click", () => {
            this.deckIndex = -1;
            this.clickedCards = [];
            this.setDocument();
        });
        drawstack.appendChild(slot);
    }
    if (this.deckIndex >= 0) {
        let card = this.deck.cards[this.deckIndex].makeCard();
        card.addEventListener("click", () => {
            if (this.clickedCards.length == 0) {
                card.style.border = "3px solid cyan";
                this.clickedCards = [this.deck.cards[this.deckIndex]];
                this.clickedCardsOrigin = "draw";
            }
            else {
                card.style.border = "";
                this.clickedCards = [];
            }
        });
        drawstack.appendChild(card);
    }
    else {
        drawstack.appendChild(makeSlotCard());
    }

    let stacks = document.getElementById("stacks");
    stacks.innerHTML = "";
    for (let i = 0; i < this.stacks.length; i++) {
        let stack = document.createElement("div");
        stack.className = "stack";
        let spacer = document.createElement("div");
        spacer.className = "spacer";
        stack.appendChild(spacer);
        if (this.stacks[i].cards.length == 0) {
            let card = makeSlotCard();
            card.addEventListener("click", () => {
                // check if there is a clicked card
                if (this.clickedCards.length > 0) {
                    // if the clicked card is a king, allow it to be placed
                    this.moveCards(i);
                }
            });
            stack.appendChild(card);
        }
        for (let j = 0; j < this.stacks[i].cards.length; j++) {
            let card;
            if (j >= this.stacks[i].index) {
                card = this.stacks[i].cards[j].makeCard();

                card.addEventListener("mouseover", () => {
                    card.style.width = "110px";
                    card.style.marginRight = "0px";
                    card.style.height = "165px";
                });

                card.addEventListener("mouseout", () => {
                    card.style.width = "100px";
                    card.style.height = "150px";
                    card.style.marginRight = "10px";
                });

                card.addEventListener("click", () => {
                    if (this.clickedCards.length == 0) {
                        card.style.border = "3px solid cyan";
                        for (let k = j; k < this.stacks[i].cards.length; k++) {
                            this.clickedCards.push(this.stacks[i].cards[k]);
                        }
                        this.clickedCardsOrigin = {stack: i, index: j};
                    }
                    else {
                        this.moveCards(i);
                    }
                    
                });
            }
            else {
                card = makeHiddenCard();
            }
            card.classList.add('stackcard')
            stack.appendChild(card);
        }
        stacks.appendChild(stack);
    }

    let fullstacks = document.getElementById("fullstacks");
    fullstacks.innerHTML = "";
    for (let i = 0; i < this.fullStacks.length; i++) {
        let card;
        if (this.fullStacks[i].length == 0) {
            card = makeSlotCard();
        }
        else {
            card = this.fullStacks[i][this.fullStacks[i].length - 1].makeCard();    
        }
        card.addEventListener("click", () => { 
            this.moveCards(i, isFullStack=true);
        })
        fullstacks.appendChild(card);
    }

}

Solitaire.prototype.hasWon = function() {
    // won if all foundation stacks are at 13 cards
    for (let i = 0; i < this.fullStacks.length; i++) {
        if (this.fullStacks[i].length < 13) {
            return false;
        }
    }
    return true;
}

Solitaire.prototype.moveCards = function(stackIndex, isFullStack=false) {
    // check if the move is valid
    // i.e. look at the first card of the move stack and last card of the destination
    let card = this.clickedCards[0];
    let canMove = true;
    if (isFullStack) {
        if (this.clickedCards.length != 1) {
            canMove = false;
        }
        else {
            if (this.fullStacks[stackIndex].length > 0) {
                // check the top card
                let top = this.fullStacks[stackIndex][this.fullStacks[stackIndex].length - 1];
                // ensure the same suit and exactly one level higher
                if (top.suit != this.clickedCards[0].suit || top.value != this.clickedCards[0].value - 1)
                    canMove = false;
            }
            else {
                if (card.value != 0)
                    canMove = false;
            }
        }
    }
    else {
        if (this.stacks[stackIndex].cards.length == 0) {
            // the operation is only valid if the card is a king
            if (card.value != 12) {
                canMove = false;
            }
        }
        else {
            // check the top card
            let top = this.stacks[stackIndex].cards[this.stacks[stackIndex].cards.length - 1];
            if (!card.canPlaceOn(top)) {
                canMove = false;
            }
        }
    }


    if (canMove) {
        this.clickedCards.forEach(card => {
            if (isFullStack) {
                this.fullStacks[stackIndex].push(card);
            }
            else {
                this.stacks[stackIndex].cards.push(card);
            }
        });
        if (this.clickedCardsOrigin == "draw") {
            // remove the card from the deck
            this.deck.cards.splice(this.deckIndex, 1);
            this.deckIndex--;
        }
        else {
            // then it is from a stack
            if (this.stacks[this.clickedCardsOrigin.stack].index == this.clickedCardsOrigin.index) {
                this.stacks[this.clickedCardsOrigin.stack].index--;
                if (this.stacks[this.clickedCardsOrigin.stack].index < 0)
                    this.stacks[this.clickedCardsOrigin.stack].index = 0;
            }
            this.stacks[this.clickedCardsOrigin.stack].cards.splice(this.clickedCardsOrigin.index)
            
        }
    }

    this.clickedCards = [];
    this.clickedCardsOrigin = "none";
    this.setDocument();
}