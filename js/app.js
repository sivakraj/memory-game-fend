/**
 * A node list that holds all of the cards
 */
const cards = document.querySelectorAll('.card');

//convert the nodelist to array for easy shuffling and update to DOM
const cardArray = [...cards];

//Holder for element containing 'deck' class
const deckHolder = document.querySelector('.deck');

//Holder for element containing 'moves' class
const movesHolder = document.querySelector('.moves');

//Holder for element containing 'stars' class
const starsHolder = document.querySelector('.stars');

//Holds child elements of stars class (all 'li's under 'ul'
const starElementChildren = starsHolder.children;

//Final result pop up content holder
const popContentHolder = document.querySelector('.pop-content');

//Holder for timer section of the page
const timerHolder = document.querySelector('.timer');

/**
 *  @description Shuffle the cards on the page
 * @param {array} array
 * @returns {array} shuffled array of cards
 */
// Shuffle function from http://stackoverflow.com/a/2450976
function shuffle(array) {
    let currentIndex = array.length, temporaryValue, randomIndex;

    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

/**
 * @description Restarts the game by defaulting the moves count, stars and timer
 * Also shuffles the card and makes it hidden for the game to being
 */
function restartGame() {
    shuffle(cardArray);
    clearDeck();
    displayCards(cardArray);
    movesHolder.innerText = '0';
    resetRating();
    clearTimeout(t);
    timerHolder.innerText = '00:00:00';
}

/**
 * @description Takes the shuffled card as array and puts it back in the page grid
 * Also removes classes added to cards for opening, closing and animations
 * @param cardArray
 */
function displayCards(cardArray) {
    //Doesn't improve performance much but added for hands-on on this concept and as a future proof
    //And it's always safe to do this way
    const deckFragment = document.createDocumentFragment();
    cardArray.forEach(card => {
        card.classList.remove('match', 'open', 'show', 'no-match');
        deckFragment.appendChild(card)
    });
    deckHolder.appendChild(deckFragment);
}

/**
 * @description Clears the deck of cards so that shuffled cards can be put in back here
 */
function clearDeck() {
    deckHolder.innerHTML = '';
}

/**
 * Adds event listener to the element of class 'deck' and the event is propagated
 * Calls the function 'repsondToCardClick' on click of this element
 */
deckHolder.addEventListener('click', respondToCardClick);

/**
 * @description Parent of all methods which will get sequentially executed on click of each card
 * Calls 'flipCard' and 'popFinalScreen' methods for further actions
 * @param event
 */
function respondToCardClick(event) {
    if (event.target.nodeName.toLowerCase() === 'li') {
        flipCard(event);
        popFinalScreen();
    }
}

/**
 * @description Invokes the startTime method if move count is 1
 * @param movesCount
 */
function startClock(movesCount) {
    if (movesCount === 1) {
        startTime();
    }
}

/**
 * @description Flips the clicked card and calls findMatchCards method for further actions
 * @param event
 */
function flipCard(event) {
    const targetElement = event.target;
    if (targetElement.classList.contains('match') || targetElement.classList.contains('open')) {
        return;
    } else {
        updateClass(targetElement, 'open', true);
        updateClass(targetElement, 'show', true);
        findMatchCards();
    }
}

/**
 * @description Keeps track of any two open cards and toggles the cards based on if two identical cards are clicked or not
 * Calls updateRating method to update the star ratings
 */
function findMatchCards() {
    const openCards = document.querySelectorAll('.open');
    if (openCards.length === 2) {
        if (openCards[0].firstElementChild.className === openCards[1].firstElementChild.className) {
            updateClass(openCards[0], 'card match', false);
            updateClass(openCards[1], 'card match', false);
        } else {
            updateClass(openCards[0], 'no-match', true);
            updateClass(openCards[1], 'no-match', true);
            setTimeout(function () {
                updateClass(openCards[0], 'card', false);
                updateClass(openCards[1], 'card', false);
            }, 1000)
        }
        updateRating();
    }
}

/**
 * @description Generic method which adds/removes/updates class being passed as arguments
 * @param element
 * @param className
 * @param isAppend
 */
function updateClass(element, className, isAppend) {
    if (isAppend) {
        element.classList.add(className);
    } else {
        element.className = className;
    }
}

/**
 * @description Updates rating based on move counts. Also starts the clock
 */
function updateRating() {
    const movesCount = Number(movesHolder.textContent) + 1; //Don't want to create a global variable for this
    movesHolder.textContent = movesCount;
    if (movesCount >= 15 && movesCount <= 20) {
        updateClass(starElementChildren[2].firstElementChild, 'fa fa-star-half-empty', false);
    } else if (movesCount >= 21 && movesCount <= 24) {
        updateClass(starElementChildren[2].firstElementChild, 'fa fa-star-o', false);
        updateClass(starElementChildren[1].firstElementChild, 'fa fa-star-half-empty', false);
    } else if (movesCount > 24) {
        applyClassInBulk(starElementChildren, 'fa fa-star-o', false);

    }
    startClock(movesCount);
}

/**
 * @description Generic class written to apply a particular class for a bulk of elements
 * @param collectionOfElements
 * @param className
 * @param isAppend
 */
function applyClassInBulk(collectionOfElements, className, isAppend) {
    for (let eachElement of collectionOfElements) {
        updateClass(eachElement.firstElementChild, className, isAppend);
    }
}

/**
 * @description Resets rating to three starts. Invoked during resetting the game or when the user clicks 'Play Again' button
 */
function resetRating() {
    applyClassInBulk(starElementChildren, 'fa fa-star', false);
}

/**
 * @description Pops the final Congratulations modal when all the cards are matched in the game
 */
function popFinalScreen() {
    const matchCount = document.querySelectorAll('.match').length;
    if (matchCount === 16) {
        clearTimeout(t);
        document.querySelector('.overlay').classList.add('target');
        popContentHolder.firstElementChild.textContent = `You have completed this game in ${timerHolder.textContent}.`;
        popContentHolder.children[1].textContent = `Total moves: ${movesHolder.textContent}.`;
        popContentHolder.lastElementChild.firstElementChild.innerHTML = starsHolder.outerHTML;
        storeInLocalStorage();
    }
}

/**
 * Adds event listener to parent of button elements and event is propagated
 */
document.querySelector('.button-elements').addEventListener('click', closeThePopup);

/**
 * @description Closes the final modal and resets the game if user clicks the button 'Play Again'
 * @param event
 */
function closeThePopup(event) {
    const targetElement = event.target;
    document.querySelector('.overlay').classList.remove('target');
    if (targetElement.nodeName.toLowerCase() == 'span') {
        if (targetElement.parentElement.classList.contains('play-again')) {
            restartGame();
        }
    } else if (targetElement.nodeName.toLowerCase() == 'button') {
        if (targetElement.classList.contains('play-again')) {
            restartGame();
        }
    }
}

/**
 * Variables initialized for timer operation
 */
let t, h = 0, m = 0, s = 0; //Unable to accomplish without global variable as clearTimeout needs to be called in another method

/**
 * Starts the time and updates back under timer section of the page
 */
function startTime() {
    s++;
    if (s > 59) {
        s = 0;
        m++;
    }
    if (m > 59) {
        m = 0;
        h++;
    }
    if (h > 23) { //rare to happen but included for completeness and to handle the situation in case it happens
        s = 0;
        m = 0;
        h = 0;
    }
    document.querySelector('.timer').textContent =
        formatTimeElement(h) + ":" + formatTimeElement(m) + ":" + formatTimeElement(s);
    t = setTimeout(startTime, 1000);
}

/**
 * Formats the time being displayed. Prefixes '0' in case hour, minutes and seconds are in single digit
 * @param value
 * @returns {string}
 */
function formatTimeElement(value) {
    return value < 10 ? '0' + value : value;
}

/**
 * Stores game result in local storage. Maximum of 3 records are stored.
 * Calls displayGameHistory method to display game history in popup section
 */
function storeInLocalStorage() {
    let gameHistory = [];
    if (localStorage.history) {
        gameHistory = JSON.parse(localStorage.history);
    }
    gameHistory.push({
        timeTaken: timerHolder.textContent,
        totalMoves: movesHolder.textContent,
        starsEarned: starsHolder.outerHTML
    });

    //Keep not more than 3 records for the Game history section
    if (gameHistory.length > 3) {
        //Remove first record
        gameHistory.shift();
    }

    localStorage.history = JSON.stringify(gameHistory);
    displayGameHistory();
}

/**
 * Displays the game history in final modal. Game history is displayed chronologically in ascending order.
 */
function displayGameHistory() {
    const locallySavedData = JSON.parse(localStorage.history);
    const historyFragment = document.createDocumentFragment();
    locallySavedData.forEach(localData => {
        const trElement = document.createElement('tr');
        const tdElement1 = document.createElement('td');
        const tdElement2 = document.createElement('td');
        const tdElement3 = document.createElement('td');
        //assign values
        tdElement1.textContent = localData.timeTaken;
        tdElement2.textContent = localData.totalMoves;
        tdElement3.innerHTML = localData.starsEarned;
        trElement.appendChild(tdElement1);
        trElement.appendChild(tdElement2);
        trElement.appendChild(tdElement3);

        historyFragment.appendChild(trElement)
    });
    const tableBody = document.querySelector('tbody');
    tableBody.innerHTML = '';
    tableBody.appendChild(historyFragment);
}
