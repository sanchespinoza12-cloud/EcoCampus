// Game Elements
const trashData = [
    { id: 1, icon: '🍌', type: 'organico', name: 'Cáscara de plátano' },
    { id: 2, icon: '📰', type: 'papel', name: 'Periódico' },
    { id: 3, icon: '🍾', type: 'vidrio', name: 'Botella de vidrio' },
    { id: 4, icon: '🥤', type: 'plastico', name: 'Vaso plástico' },
    { id: 5, icon: '🍎', type: 'organico', name: 'Corazón de manzana' },
    { id: 6, icon: '📦', type: 'papel', name: 'Caja de cartón' },
    { id: 7, icon: '🛍️', type: 'plastico', name: 'Bolsa plástica' },
    { id: 8, icon: '🥫', type: 'plastico', name: 'Lata de conserva' }, // Cans often go in yellow bin with plastics depending on local rules
    { id: 9, icon: '🌿', type: 'organico', name: 'Hojas secas' },
    { id: 10, icon: '🍷', type: 'vidrio', name: 'Copa rota' },
    { id: 11, icon: '📝', type: 'papel', name: 'Hoja de papel' },
    { id: 12, icon: '🧴', type: 'plastico', name: 'Botella de champú' },
];

// DOM Elements
const trashContainer = document.getElementById('trash-container');
const bins = document.querySelectorAll('.bin');
const scoreEl = document.getElementById('score');
const timeLeftEl = document.getElementById('time-left');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const startOverlay = document.getElementById('game-start-overlay');
const gameOverOverlay = document.getElementById('game-over-overlay');
const finalScoreEl = document.getElementById('final-score');

// Game State
let score = 0;
let timeLeft = 30;
let timerId = null;
let currentItems = [];

// Initialize Event Listeners
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

// Setup drop zones
bins.forEach(bin => {
    bin.addEventListener('dragover', dragOver);
    bin.addEventListener('dragenter', dragEnter);
    bin.addEventListener('dragleave', dragLeave);
    bin.addEventListener('drop', drop);
});

function startGame() {
    score = 0;
    timeLeft = 30;
    scoreEl.textContent = score;
    timeLeftEl.textContent = timeLeft;
    
    startOverlay.classList.add('hidden');
    gameOverOverlay.classList.add('hidden');
    
    trashContainer.innerHTML = '';
    spawnItems();
    
    if (timerId) clearInterval(timerId);
    timerId = setInterval(updateTimer, 1000);
}

function updateTimer() {
    timeLeft--;
    timeLeftEl.textContent = timeLeft;
    
    if (timeLeft <= 0) {
        endGame();
    }
}

function endGame() {
    clearInterval(timerId);
    finalScoreEl.textContent = score;
    gameOverOverlay.classList.remove('hidden');
    trashContainer.innerHTML = '';
}

function spawnItems() {
    // Generate 3 random items to display at a time
    while(trashContainer.children.length < 4) {
        spawnSingleItem();
    }
}

function spawnSingleItem() {
    const randomItem = trashData[Math.floor(Math.random() * trashData.length)];
    
    const div = document.createElement('div');
    div.classList.add('trash-item');
    div.setAttribute('draggable', true);
    div.setAttribute('data-type', randomItem.type);
    div.textContent = randomItem.icon;
    div.title = randomItem.name;
    
    // Drag Events
    div.addEventListener('dragstart', dragStart);
    div.addEventListener('dragend', dragEnd);
    
    trashContainer.appendChild(div);
}

// Drag & Drop Functions
let draggedItem = null;

function dragStart(e) {
    draggedItem = this;
    setTimeout(() => this.classList.add('dragging'), 0);
    // Needed for Firefox
    e.dataTransfer.setData('text/plain', this.dataset.type);
    e.dataTransfer.effectAllowed = 'move';
}

function dragEnd() {
    this.classList.remove('dragging');
    draggedItem = null;
}

function dragOver(e) {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = 'move';
}

function dragEnter(e) {
    e.preventDefault();
    this.classList.add('drag-over');
}

function dragLeave() {
    this.classList.remove('drag-over');
}

function drop(e) {
    e.preventDefault();
    this.classList.remove('drag-over');
    
    if (!draggedItem) return;

    const binType = this.dataset.type;
    const itemType = draggedItem.dataset.type;

    if (binType === itemType) {
        // Correct classification
        score += 10;
        scoreEl.textContent = score;
        
        // Visual feedback
        this.classList.add('correct');
        setTimeout(() => this.classList.remove('correct'), 500);
        
        // Remove item and spawn new one
        draggedItem.remove();
        spawnSingleItem();
    } else {
        // Wrong classification
        score = Math.max(0, score - 5);
        scoreEl.textContent = score;
        
        // Visual feedback
        this.classList.add('wrong');
        setTimeout(() => this.classList.remove('wrong'), 400);
        
        // Time penalty
        timeLeft = Math.max(0, timeLeft - 2);
        timeLeftEl.textContent = timeLeft;
    }
}
