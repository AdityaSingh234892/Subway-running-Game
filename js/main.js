/**
 * Subway Runner 3D - Main Entry Point
 * This file initializes the game and connects all modules
 */

// Game state constants
const GameState = {
    LOADING: 'loading',
    START_MENU: 'start_menu',
    PLAYING: 'playing',
    GAME_OVER: 'game_over',
    PAUSED: 'paused'
};

// Global game variables
let gameState = GameState.LOADING;
let score = 0;
let coins = 0;
let distance = 0;
let speedMultiplier = 1.0;
let highScore = localStorage.getItem('subwayRunnerHighScore') || 0;

// DOM Elements
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const gameUI = document.getElementById('gameUI');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');
const menuButton = document.getElementById('menuButton');
const scoreElement = document.getElementById('score');
const coinCountElement = document.getElementById('coinCount');
const distanceElement = document.getElementById('distance');
const speedMultiplierElement = document.getElementById('speedMultiplier');
const finalScoreElement = document.getElementById('finalScore');
const finalCoinsElement = document.getElementById('finalCoins');
const finalDistanceElement = document.getElementById('finalDistance');
const highScoreElement = document.getElementById('highScore');
const loadingElement = document.getElementById('loading');
const muteButton = document.getElementById('muteButton');
const laneDots = document.querySelectorAll('.lane-dot');

// Game modules (will be initialized after loading)
let gameManager, player, environment, obstacleManager, uiManager, physics;

// Polyfill for THREE.CapsuleGeometry (not available in Three.js r128)
if (typeof THREE !== 'undefined' && !THREE.CapsuleGeometry) {
    THREE.CapsuleGeometry = class CapsuleGeometry extends THREE.CylinderGeometry {
        constructor(radius = 1, length = 1, capSegments = 8, radialSegments = 8) {
            super(radius, radius, length, capSegments, 1, false);
            // This is a simple approximation; real CapsuleGeometry would have rounded caps
            // but for our purposes, CylinderGeometry works fine.
        }
    };
}

// Initialize the game when the page loads
window.addEventListener('DOMContentLoaded', () => {
    console.log('Subway Runner 3D - Initializing...');
    
    // Show loading screen
    showLoading(true);
    
    // Load game modules
    loadGameModules();
});

/**
 * Load all game modules and initialize Three.js scene
 */
function loadGameModules() {
    // Import modules (they are loaded via script tags in HTML)
    // We'll initialize them after a short delay to ensure they're loaded
    setTimeout(() => {
        try {
            // Initialize game manager first
            gameManager = new GameManager();
            
            // Initialize the game (creates scene, camera, renderer, starts loop)
            gameManager.init();
            
            // Initialize other modules (they need the scene)
            player = new Player(gameManager);
            environment = new Environment(gameManager);
            obstacleManager = new ObstacleManager(gameManager);
            uiManager = new UIManager(gameManager);
            physics = new Physics(gameManager);
            
            // Connect modules
            gameManager.setModules(player, environment, obstacleManager, uiManager, physics);
            
            // Hide loading screen
            showLoading(false);
            
            // Set game state to start menu
            setGameState(GameState.START_MENU);
            
            console.log('Game modules loaded successfully!');
        } catch (error) {
            console.error('Error loading game modules:', error);
            showLoading(false);
            alert('Failed to load game. Please check console for errors.');
        }
    }, 500);
}

/**
 * Show or hide the loading screen
 */
function showLoading(show) {
    if (loadingElement) {
        loadingElement.classList.toggle('hidden', !show);
    }
}

/**
 * Update the game state and UI accordingly
 */
function setGameState(newState) {
    gameState = newState;
    
    // Update UI visibility based on state
    switch (gameState) {
        case GameState.START_MENU:
            startScreen.classList.remove('hidden');
            gameOverScreen.classList.add('hidden');
            gameUI.classList.add('hidden');
            break;
            
        case GameState.PLAYING:
            startScreen.classList.add('hidden');
            gameOverScreen.classList.add('hidden');
            gameUI.classList.remove('hidden');
            break;
            
        case GameState.GAME_OVER:
            startScreen.classList.add('hidden');
            gameOverScreen.classList.remove('hidden');
            gameUI.classList.add('hidden');
            updateGameOverStats();
            break;
            
        case GameState.PAUSED:
            // Pause game logic
            break;
    }
    
    // Notify game manager
    if (gameManager) {
        gameManager.onGameStateChange(gameState);
    }
}

/**
 * Update score and UI
 */
function updateScore(points) {
    score += points;
    if (scoreElement) {
        scoreElement.textContent = Math.floor(score);
    }
    
    // Update high score if needed
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('subwayRunnerHighScore', highScore);
    }
}

/**
 * Update coin count
 */
function updateCoins(count) {
    coins += count;
    if (coinCountElement) {
        coinCountElement.textContent = coins;
    }
}

/**
 * Update distance traveled
 */
function updateDistance(meters) {
    distance += meters;
    if (distanceElement) {
        distanceElement.textContent = Math.floor(distance) + 'm';
    }
}

/**
 * Update speed multiplier display
 */
function updateSpeedMultiplier(multiplier) {
    speedMultiplier = multiplier;
    if (speedMultiplierElement) {
        speedMultiplierElement.textContent = multiplier.toFixed(1) + 'x';
    }
}

/**
 * Update lane indicator dots
 */
function updateLaneIndicator(currentLane) {
    laneDots.forEach((dot, index) => {
        if (index === currentLane) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

/**
 * Update game over screen statistics
 */
function updateGameOverStats() {
    if (finalScoreElement) finalScoreElement.textContent = Math.floor(score);
    if (finalCoinsElement) finalCoinsElement.textContent = coins;
    if (finalDistanceElement) finalDistanceElement.textContent = Math.floor(distance) + 'm';
    if (highScoreElement) highScoreElement.textContent = Math.floor(highScore);
}

/**
 * Reset game to initial state
 */
function resetGame() {
    score = 0;
    coins = 0;
    distance = 0;
    speedMultiplier = 1.0;
    
    // Update UI
    updateScore(0);
    updateCoins(0);
    updateDistance(0);
    updateSpeedMultiplier(1.0);
    updateLaneIndicator(1); // Center lane
    
    // Reset game modules
    if (gameManager) {
        gameManager.reset();
    }
    
    // Start playing
    setGameState(GameState.PLAYING);
}

/**
 * Handle game over
 */
function gameOver() {
    setGameState(GameState.GAME_OVER);
}

// Event Listeners
startButton.addEventListener('click', () => {
    resetGame();
});

restartButton.addEventListener('click', () => {
    resetGame();
});

menuButton.addEventListener('click', () => {
    setGameState(GameState.START_MENU);
});

muteButton.addEventListener('click', () => {
    const icon = muteButton.querySelector('i');
    if (icon.classList.contains('fa-volume-up')) {
        icon.classList.remove('fa-volume-up');
        icon.classList.add('fa-volume-mute');
        // Mute audio logic would go here
    } else {
        icon.classList.remove('fa-volume-mute');
        icon.classList.add('fa-volume-up');
        // Unmute audio logic would go here
    }
});

// Keyboard controls
document.addEventListener('keydown', (event) => {
    // Only process if game is playing
    if (gameState !== GameState.PLAYING || !player) return;
    
    switch (event.key) {
        case 'ArrowLeft':
            event.preventDefault();
            player.moveLeft();
            break;
            
        case 'ArrowRight':
            event.preventDefault();
            player.moveRight();
            break;
            
        case 'ArrowUp':
            event.preventDefault();
            player.jump();
            break;
            
        case 'ArrowDown':
            event.preventDefault();
            player.slide();
            break;
            
        case ' ':
            event.preventDefault();
            // Space bar for jump alternative
            player.jump();
            break;
            
        case 'Escape':
            // Pause game
            if (gameState === GameState.PLAYING) {
                setGameState(GameState.PAUSED);
            } else if (gameState === GameState.PAUSED) {
                setGameState(GameState.PLAYING);
            }
            break;
    }
});

// Export global functions for other modules to use
window.game = {
    updateScore,
    updateCoins,
    updateDistance,
    updateSpeedMultiplier,
    updateLaneIndicator,
    gameOver,
    getGameState: () => gameState,
    getScore: () => score,
    getCoins: () => coins,
    getDistance: () => distance,
    getSpeedMultiplier: () => speedMultiplier
};

console.log('Main.js loaded successfully!');