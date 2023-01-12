let game = new Solitaire();

game.setDocument();

function moveCardsFromStack(start, startIndex, target) {
    // get all cards from the start stack and place on target
    game.clickedCards = game.stacks[start].cards.slice(startIndex);
    game.clickedCardsOrigin = {stack: start, index: startIndex};
    game.moveCards(target);
}  

function moveCardsFromDeck(target) {
    game.clickedCardsOrigin = "draw";
    game.clickedCards = [game.deck.cards[game.deckIndex]];
    game.moveCards(target);
}

function moveCardsToFoundation(start, startIndex, foundationIndex) {
    game.clickedCards = game.stacks[start].cards.slice(startIndex);
    game.clickedCardsOrigin = {stack: start, index: startIndex};
    game.moveCards(foundationIndex, isFullStack=true);
}

function moveCardsToFoundationFromDeck(foundationIndex) {
    game.clickedCardsOrigin = "draw";
    game.clickedCards = [game.deck.cards[game.deckIndex]];
    game.moveCards(foundationIndex, isFullStack=true);
}

let drawCount = 0;
let winCount = 0, loseCount = 0;
function endGame(hasWon) {
    if (hasWon) {
        winCount++;
    }
    else {
        loseCount++;
    }
    let totalCount = winCount + loseCount;
    let wgr = winCount / totalCount * 100;
    document.getElementById("losecount").innerText = loseCount;
    document.getElementById("wincount").innerText = winCount;
    document.getElementById("totalcount").innerText = totalCount;
    document.getElementById("wgr").innerText = Math.round(wgr * 100) / 100 + "%";
    drawCount = 0;
    game = new Solitaire();
}

function nextMove() {
    // check if card can be put in a foundation
    for (let i = 0; i < game.stacks.length; i++) {
        if (game.stacks[i].cards.length == 0) {
            continue;
        }
        let card = game.stacks[i].cards[game.stacks[i].cards.length - 1];
        for (let j = 0; j < game.fullStacks.length; j++) {
            if (card.canPlaceOnFoundation(game.fullStacks[j])) {
                moveCardsToFoundation(i, game.stacks[i].cards.length - 1, j);
                drawCount = 0;
                return;
            }
        }
    }

    if (game.deckIndex >= 0) {
        let card = game.deck.cards[game.deckIndex];
        for (let j = 0; j < game.fullStacks.length; j++) {
            if (card.canPlaceOnFoundation(game.fullStacks[j])) {
                moveCardsToFoundationFromDeck(j);
                drawCount = 0;
                return;
            }
        }
    }

    // first move will be to go across the board and check
    // if any base can be moved onto any other stack
    for (let i = 0; i < game.stacks.length; i++) {
        if (game.stacks[i].cards.length == 0)
            continue;
        let card = game.stacks[i].cards[game.stacks[i].index];
        for (let j = 0; j < game.stacks.length; j++) {
            if (game.stacks[i].index > 0 && card.value == 12 && game.stacks[j].cards.length == 0) {
                moveCardsFromStack(i, game.stacks[i].index, j);
                drawCount = 0;
                return;
            }
            if (i == j || game.stacks[j].cards.length == 0)
                continue;
            let otherCard = game.stacks[j].cards[game.stacks[j].cards.length - 1];
            if (card.canPlaceOn(otherCard)) {
                // then move card to other card
                moveCardsFromStack(i, game.stacks[i].index, j)
                drawCount = 0;
                return;
            }
        }
    }

    // check if there is a card in the draw pile
    if (game.deckIndex >= 0) {
        let card = game.deck.cards[game.deckIndex];
        for (let j = 0; j < game.stacks.length; j++) {
            if (card.value == 12 && game.stacks[j].cards.length == 0) {
                moveCardsFromDeck(j);
                drawCount = 0;
                return;
            }
            if (game.stacks[j].cards.length == 0) 
                continue;
            let otherCard = game.stacks[j].cards[game.stacks[j].cards.length - 1];
            if (card.canPlaceOn(otherCard)) {
                // then move card to other card
                moveCardsFromDeck(j)
                drawCount = 0;
                return;
            }
        }
    }

    // last option is to just draw a card
    game.drawCard();
    if (game.hasWon()) {
        endGame(true);
    }
    drawCount++;
    if (drawCount > game.deck.cards.length + 1) {
        endGame(false);
        // loser!
    }
}

let useAI = false;

function toggleAI() {
    useAI = !useAI;
}

setInterval(() => {
    if (useAI) {
        nextMove();
    }
}, 100);