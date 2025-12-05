document.addEventListener('DOMContentLoaded', () => {
  // --- Configuration ---
  const fruits = [
    '1-pear.svg',
    '1-strawberries.svg',
    '3-watermelon.svg',
    '4-lemon.svg',
    '5-orange.svg',
    '6-grapes.svg',
    '7-cherry.svg',
    '8-blackberry.svg',
    '9-apple.svg',
    '10-plum.svg',
    '11-pineapple.svg',
    '12-avocado.svg'
  ];

  const difficultySettings = {
    easy: { pairs: 6, gridClass: 'grid-easy' },
    hard: { pairs: 12, gridClass: 'grid-hard' }
  };

  // --- State ---
  let cards = [];
  let hasFlippedCard = false;
  let lockBoard = false;
  let firstCard, secondCard;
  let moves = 0;
  let matches = 0;
  let totalPairs = 0;
  let gameActive = false;

  // --- Elements ---
  const grid = document.getElementById('memory-game-grid');
  const difficultySelect = document.getElementById('difficulty');
  const startButton = document.getElementById('start-button');
  const restartButton = document.getElementById('restart-button');
  const movesDisplay = document.getElementById('moves-count');
  const matchesDisplay = document.getElementById('matches-count');
  const winMessage = document.getElementById('win-message');
  const finalMovesDisplay = document.getElementById('final-moves');

  // --- Event Listeners ---
  startButton.addEventListener('click', startGame);
  restartButton.addEventListener('click', restartGame);
  difficultySelect.addEventListener('change', resetGameUI);

  // --- Functions ---

  function resetGameUI() {
    // Stop current game
    gameActive = false;
    grid.innerHTML = '';
    grid.className = 'memory-game-grid'; // Reset grid classes

    // Reset stats display
    moves = 0;
    matches = 0;
    updateStats();

    // Reset buttons
    startButton.disabled = false;
    restartButton.disabled = true;

    // Hide win message
    winMessage.classList.add('d-none');
  }

  function startGame() {
    resetGameUI();
    gameActive = true;
    startButton.disabled = true;
    restartButton.disabled = false;

    const difficulty = difficultySelect.value;
    const settings = difficultySettings[difficulty];
    totalPairs = settings.pairs;

    // Apply grid layout class
    grid.classList.add(settings.gridClass);

    // Prepare deck
    const selectedFruits = fruits.slice(0, totalPairs);
    const deck = [...selectedFruits, ...selectedFruits];
    shuffle(deck);

    // Generate Cards
    deck.forEach(fruit => {
      const card = createCard(fruit);
      grid.appendChild(card);
    });

    // Add event listeners to cards
    cards = document.querySelectorAll('.memory-card');
    cards.forEach(card => card.addEventListener('click', flipCard));
  }

  function restartGame() {
    startGame();
  }

  function createCard(fruitImage) {
    const card = document.createElement('div');
    card.classList.add('memory-card');
    card.dataset.fruit = fruitImage;

    // Front face
    const frontFace = document.createElement('div');
    frontFace.classList.add('front-face');
    const img = document.createElement('img');
    img.src = `assets/img/fruits/${fruitImage}`;
    img.alt = 'Fruit';
    img.style.width = '60%';
    frontFace.appendChild(img);

    // Back face
    const backFace = document.createElement('div');
    backFace.classList.add('back-face');

    card.appendChild(frontFace);
    card.appendChild(backFace);

    return card;
  }

  function flipCard() {
    if (lockBoard) return;
    if (this === firstCard) return;
    if (!gameActive) return;

    this.classList.add('flip');

    if (!hasFlippedCard) {
      // First click
      hasFlippedCard = true;
      firstCard = this;
      return;
    }

    // Second click
    secondCard = this;
    incrementMoves();
    checkForMatch();
  }

  function checkForMatch() {
    let isMatch = firstCard.dataset.fruit === secondCard.dataset.fruit;

    if (isMatch) {
      disableCards();
      matches++;
      updateStats();
      if (matches === totalPairs) {
        endGame();
      }
    } else {
      unflipCards();
    }
  }

  function disableCards() {
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
    resetBoard();
  }

  function unflipCards() {
    lockBoard = true;

    setTimeout(() => {
      firstCard.classList.remove('flip');
      secondCard.classList.remove('flip');
      resetBoard();
    }, 1000);
  }

  function resetBoard() {
    [hasFlippedCard, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
  }

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  function incrementMoves() {
    moves++;
    updateStats();
  }

  function updateStats() {
    movesDisplay.textContent = moves;
    matchesDisplay.textContent = matches;
  }

  function endGame() {
    gameActive = false;
    finalMovesDisplay.textContent = moves;
    winMessage.classList.remove('d-none');
  }
});
