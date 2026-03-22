/**
 * UI Manager - Handles user interface updates and game state feedback
 */

class UIManager {
    constructor(gameManager) {
        this.gameManager = gameManager;
        
        // UI elements
        this.scoreElement = document.getElementById('score');
        this.coinCountElement = document.getElementById('coinCount');
        this.distanceElement = document.getElementById('distance');
        this.speedMultiplierElement = document.getElementById('speedMultiplier');
        this.laneDots = document.querySelectorAll('.lane-dot');
        
        // Game state tracking
        this.lastScore = 0;
        this.lastCoinCount = 0;
        this.lastDistance = 0;
        this.lastSpeedMultiplier = 1.0;
        
        // Visual effects
        this.coinPopElements = [];
        this.maxCoinPopElements = 5;
        
        // Initialize UI
        this.init();
        
        console.log('UI Manager initialized!');
    }
    
    /**
     * Initialize UI elements
     */
    init() {
        // Set initial values
        this.updateScore(0);
        this.updateCoins(0);
        this.updateDistance(0);
        this.updateSpeedMultiplier(1.0);
        this.updateLaneIndicator(1); // Center lane
        
        // Create coin pop elements for visual feedback
        this.createCoinPopElements();
    }
    
    /**
     * Create floating coin pop elements for visual feedback
     */
    createCoinPopElements() {
        const container = document.getElementById('gameContainer');
        
        for (let i = 0; i < this.maxCoinPopElements; i++) {
            const pop = document.createElement('div');
            pop.className = 'coin-pop hidden';
            pop.textContent = '';
            pop.style.position = 'absolute';
            pop.style.color = 'gold';
            pop.style.fontWeight = 'bold';
            pop.style.fontSize = '1.5rem';
            pop.style.textShadow = '0 0 5px black';
            pop.style.pointerEvents = 'none';
            pop.style.zIndex = '100';
            container.appendChild(pop);
            this.coinPopElements.push(pop);
        }
    }
    
    /**
     * Update score display with animation
     */
    updateScore(score) {
        if (!this.scoreElement) return;
        
        // Format score with commas
        const formattedScore = Math.floor(score).toLocaleString();
        this.scoreElement.textContent = formattedScore;
        
        // Add pulse animation when score increases significantly
        if (score > this.lastScore + 100) {
            this.pulseElement(this.scoreElement);
        }
        
        this.lastScore = score;
    }
    
    /**
     * Update coin count display
     */
    updateCoins(coinCount) {
        if (!this.coinCountElement) return;
        
        this.coinCountElement.textContent = coinCount;
        
        // Show coin pop effect when coins increase
        if (coinCount > this.lastCoinCount) {
            const increase = coinCount - this.lastCoinCount;
            this.showCoinPopEffect(increase);
            this.pulseElement(this.coinCountElement);
        }
        
        this.lastCoinCount = coinCount;
    }
    
    /**
     * Update distance display
     */
    updateDistance(distance) {
        if (!this.distanceElement) return;
        
        const formattedDistance = Math.floor(distance) + 'm';
        this.distanceElement.textContent = formattedDistance;
        
        // Update every 100 meters
        if (Math.floor(distance / 100) > Math.floor(this.lastDistance / 100)) {
            this.pulseElement(this.distanceElement);
        }
        
        this.lastDistance = distance;
    }
    
    /**
     * Update speed multiplier display
     */
    updateSpeedMultiplier(multiplier) {
        if (!this.speedMultiplierElement) return;
        
        const formattedMultiplier = multiplier.toFixed(1) + 'x';
        this.speedMultiplierElement.textContent = formattedMultiplier;
        
        // Change color based on speed
        if (multiplier > 2.0) {
            this.speedMultiplierElement.style.color = '#ff4444';
        } else if (multiplier > 1.5) {
            this.speedMultiplierElement.style.color = '#ffaa00';
        } else {
            this.speedMultiplierElement.style.color = '#00eeff';
        }
        
        // Pulse when speed increases
        if (multiplier > this.lastSpeedMultiplier + 0.2) {
            this.pulseElement(this.speedMultiplierElement);
        }
        
        this.lastSpeedMultiplier = multiplier;
    }
    
    /**
     * Update lane indicator dots
     */
    updateLaneIndicator(laneIndex) {
        if (!this.laneDots || this.laneDots.length === 0) return;
        
        this.laneDots.forEach((dot, index) => {
            if (index === laneIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }
    
    /**
     * Show visual feedback for coin collection
     * @param {number} amount - The amount of coins collected (positive integer)
     */
    showCoinPopEffect(amount = 1) {
        // Find an available coin pop element
        const pop = this.coinPopElements.find(el => el.classList.contains('hidden'));
        if (!pop) return;
        
        // Set text to show amount (e.g., +1, +10)
        pop.textContent = `+${amount}`;
        
        // Random position near the center
        const x = 50 + (Math.random() * 20 - 10);
        const y = 50 + (Math.random() * 20 - 10);
        
        // Set position and show
        pop.style.left = `${x}%`;
        pop.style.top = `${y}%`;
        pop.classList.remove('hidden');
        
        // Animate
        let opacity = 1;
        let scale = 1;
        let yPos = 0;
        
        const animate = () => {
            opacity -= 0.02;
            scale += 0.02;
            yPos -= 1;
            
            pop.style.opacity = opacity;
            pop.style.transform = `translateY(${yPos}px) scale(${scale})`;
            
            if (opacity > 0) {
                requestAnimationFrame(animate);
            } else {
                pop.classList.add('hidden');
                pop.style.opacity = '1';
                pop.style.transform = 'translateY(0) scale(1)';
                pop.textContent = ''; // Clear text after animation
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    /**
     * Add pulse animation to an element
     */
    pulseElement(element) {
        if (!element) return;
        
        element.classList.add('pulse');
        setTimeout(() => {
            element.classList.remove('pulse');
        }, 300);
    }
    
    /**
     * Show game over screen with statistics
     */
    showGameOver(finalScore, finalCoins, finalDistance, highScore) {
        // Update game over screen stats
        const finalScoreElement = document.getElementById('finalScore');
        const finalCoinsElement = document.getElementById('finalCoins');
        const finalDistanceElement = document.getElementById('finalDistance');
        const highScoreElement = document.getElementById('highScore');
        
        if (finalScoreElement) finalScoreElement.textContent = Math.floor(finalScore).toLocaleString();
        if (finalCoinsElement) finalCoinsElement.textContent = finalCoins;
        if (finalDistanceElement) finalDistanceElement.textContent = Math.floor(finalDistance) + 'm';
        if (highScoreElement) highScoreElement.textContent = Math.floor(highScore).toLocaleString();
        
        // Show new high score message if applicable
        if (finalScore > highScore) {
            this.showNewHighScoreMessage();
        }
    }
    
    /**
     * Show "New High Score!" message
     */
    showNewHighScoreMessage() {
        const gameOverContent = document.querySelector('#gameOverScreen .screen-content');
        if (!gameOverContent) return;
        
        // Check if message already exists
        let message = gameOverContent.querySelector('.new-high-score');
        if (!message) {
            message = document.createElement('div');
            message.className = 'new-high-score';
            message.innerHTML = '<i class="fas fa-trophy"></i> NEW HIGH SCORE!';
            message.style.color = '#FFD700';
            message.style.fontSize = '2rem';
            message.style.margin = '20px 0';
            message.style.textShadow = '0 0 10px gold';
            message.style.animation = 'pulse 1s infinite alternate';
            gameOverContent.insertBefore(message, gameOverContent.querySelector('.stats'));
        }
        
        message.classList.remove('hidden');
    }
    
    /**
     * Show in-game notification
     */
    showNotification(text, duration = 2000) {
        // Create notification element if it doesn't exist
        let notification = document.getElementById('gameNotification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'gameNotification';
            notification.style.position = 'absolute';
            notification.style.top = '20%';
            notification.style.left = '50%';
            notification.style.transform = 'translateX(-50%)';
            notification.style.background = 'rgba(0, 0, 0, 0.8)';
            notification.style.color = 'white';
            notification.style.padding = '15px 30px';
            notification.style.borderRadius = '10px';
            notification.style.border = '2px solid #00eeff';
            notification.style.zIndex = '100';
            notification.style.fontSize = '1.2rem';
            notification.style.textAlign = 'center';
            notification.style.boxShadow = '0 0 20px rgba(0, 238, 255, 0.5)';
            document.getElementById('gameContainer').appendChild(notification);
        }
        
        // Set text and show
        notification.textContent = text;
        notification.classList.remove('hidden');
        
        // Hide after duration
        setTimeout(() => {
            notification.classList.add('hidden');
        }, duration);
    }
    
    /**
     * Update all UI elements based on game state
     */
    update(gameState) {
        // This would be called regularly to update UI
        // For now, we rely on the main.js to call individual update functions
    }
    
    /**
     * Reset UI to initial state
     */
    reset() {
        this.updateScore(0);
        this.updateCoins(0);
        this.updateDistance(0);
        this.updateSpeedMultiplier(1.0);
        this.updateLaneIndicator(1);
        
        // Hide any notifications
        const notification = document.getElementById('gameNotification');
        if (notification) {
            notification.classList.add('hidden');
        }
        
        // Hide new high score message
        const highScoreMessage = document.querySelector('.new-high-score');
        if (highScoreMessage) {
            highScoreMessage.classList.add('hidden');
        }
        
        console.log('UI reset!');
    }
    
    /**
     * Handle window resize
     */
    onWindowResize() {
        // Adjust UI elements if needed
        // For now, just log
        console.log('UI Manager: Window resized');
    }
}

// Export the class
window.UIManager = UIManager;