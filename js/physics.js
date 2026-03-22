/**
 * Physics Module - Handles collision detection and game physics
 */

class Physics {
    constructor(gameManager) {
        this.gameManager = gameManager;
        
        // Collision detection settings
        this.collisionEnabled = true;
        this.coinCollectionEnabled = true;
        
        // Debug visualization
        this.debugMode = false;
        this.debugBoxes = [];
        
        console.log('Physics system initialized!');
    }
    
    /**
     * Check for collisions between player and obstacles/coins
     */
    checkCollisions(player, obstacleManager) {
        if (!this.collisionEnabled || !player || !obstacleManager) return;
        
        // Get player bounding box
        const playerBox = player.getBoundingBox();
        if (!playerBox) return;
        
        // Check obstacle collisions
        this.checkObstacleCollisions(player, playerBox, obstacleManager);
        
        // Check coin collisions
        if (this.coinCollectionEnabled) {
            this.checkCoinCollisions(player, playerBox, obstacleManager);
        }
    }
    
    /**
     * Check collisions with obstacles
     */
    checkObstacleCollisions(player, playerBox, obstacleManager) {
        const obstacles = obstacleManager.getActiveObstacles();
        
        for (const obstacle of obstacles) {
            // Get obstacle bounding box
            const obstacleBox = obstacleManager.getObstacleBoundingBox(obstacle);
            
            // Check if boxes intersect
            if (playerBox.intersectsBox(obstacleBox)) {
                // Check if player can avoid collision (jumping over or sliding under)
                if (this.canAvoidCollision(player, obstacle)) {
                    continue; // Player avoided the obstacle
                }
                
                // Handle collision
                this.handleObstacleCollision(player, obstacle);
                return; // Only handle one collision per frame
            }
        }
    }
    
    /**
     * Check if player can avoid collision based on their state
     */
    canAvoidCollision(player, obstacle) {
        const obstacleType = obstacle.userData.type;
        
        // Player is jumping - can jump over low obstacles
        if (player.isJumping) {
            // Jumping over barriers and crates
            if (obstacleType === 'barrier' || obstacleType === 'crate') {
                return true;
            }
            // Can't jump over trains
            return false;
        }
        
        // Player is sliding - can slide under high obstacles
        if (player.isSliding) {
            // Sliding under trains and signals
            if (obstacleType === 'train' || obstacleType === 'signal') {
                return true;
            }
            // Can't slide under barriers and crates
            return false;
        }
        
        // Player is in normal state - vulnerable to all obstacles
        return false;
    }
    
    /**
     * Handle collision with obstacle (game over)
     */
    handleObstacleCollision(player, obstacle) {
        console.log(`Collision with ${obstacle.userData.type}! Game Over!`);
        
        // Visual feedback
        player.onCollision();
        
        // Trigger game over
        if (window.game) {
            window.game.gameOver();
        }
        
        // Disable further collisions temporarily
        this.collisionEnabled = false;
        setTimeout(() => {
            this.collisionEnabled = true;
        }, 1000);
    }
    
    /**
     * Check collisions with coins
     */
    checkCoinCollisions(player, playerBox, obstacleManager) {
        const coins = obstacleManager.getActiveCoins();
        
        for (const coin of coins) {
            // Get coin bounding sphere
            const coinSphere = obstacleManager.getCoinBoundingSphere(coin);
            
            // Check if player box intersects with coin sphere
            if (playerBox.intersectsSphere(coinSphere)) {
                // Collect the coin
                obstacleManager.collectCoin(coin);
                
                // Only collect one coin per frame to avoid multiple collections
                break;
            }
        }
    }
    
    /**
     * Simple distance-based collision check (alternative method)
     */
    checkDistanceCollision(playerPos, objectPos, radius) {
        const dx = playerPos.x - objectPos.x;
        const dz = playerPos.z - objectPos.z;
        const distance = Math.sqrt(dx * dx + dz * dz);
        
        return distance < radius;
    }
    
    /**
     * Check if point is inside bounding box
     */
    isPointInBox(point, box) {
        return point.x >= box.min.x && point.x <= box.max.x &&
               point.y >= box.min.y && point.y <= box.max.y &&
               point.z >= box.min.z && point.z <= box.max.z;
    }
    
    /**
     * Create debug visualization for collision boxes
     */
    createDebugBox(box, color = 0xff0000) {
        if (!this.debugMode) return null;
        
        const size = new THREE.Vector3().subVectors(box.max, box.min);
        const center = new THREE.Vector3().addVectors(box.min, box.max).multiplyScalar(0.5);
        
        const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
        const material = new THREE.MeshBasicMaterial({
            color: color,
            wireframe: true,
            transparent: true,
            opacity: 0.5
        });
        
        const debugMesh = new THREE.Mesh(geometry, material);
        debugMesh.position.copy(center);
        
        this.gameManager.getScene().add(debugMesh);
        this.debugBoxes.push(debugMesh);
        
        return debugMesh;
    }
    
    /**
     * Update debug visualizations
     */
    updateDebugVisualizations(player, obstacleManager) {
        if (!this.debugMode) return;
        
        // Clear old debug boxes
        this.clearDebugBoxes();
        
        // Create debug box for player
        const playerBox = player.getBoundingBox();
        if (playerBox) {
            this.createDebugBox(playerBox, 0x00ff00);
        }
        
        // Create debug boxes for obstacles
        const obstacles = obstacleManager.getActiveObstacles();
        for (const obstacle of obstacles) {
            const obstacleBox = obstacleManager.getObstacleBoundingBox(obstacle);
            this.createDebugBox(obstacleBox, 0xff0000);
        }
        
        // Create debug spheres for coins
        const coins = obstacleManager.getActiveCoins();
        for (const coin of coins) {
            const coinSphere = obstacleManager.getCoinBoundingSphere(coin);
            this.createDebugSphere(coinSphere, 0xffff00);
        }
    }
    
    /**
     * Create debug sphere visualization
     */
    createDebugSphere(sphere, color = 0xffff00) {
        if (!this.debugMode) return null;
        
        const geometry = new THREE.SphereGeometry(sphere.radius, 8, 8);
        const material = new THREE.MeshBasicMaterial({
            color: color,
            wireframe: true,
            transparent: true,
            opacity: 0.5
        });
        
        const debugMesh = new THREE.Mesh(geometry, material);
        debugMesh.position.copy(sphere.center);
        
        this.gameManager.getScene().add(debugMesh);
        this.debugBoxes.push(debugMesh);
        
        return debugMesh;
    }
    
    /**
     * Clear all debug visualizations
     */
    clearDebugBoxes() {
        for (const box of this.debugBoxes) {
            this.gameManager.getScene().remove(box);
        }
        this.debugBoxes = [];
    }
    
    /**
     * Toggle debug mode
     */
    toggleDebugMode() {
        this.debugMode = !this.debugMode;
        console.log(`Physics debug mode: ${this.debugMode ? 'ON' : 'OFF'}`);
        
        if (!this.debugMode) {
            this.clearDebugBoxes();
        }
    }
    
    /**
     * Reset physics system
     */
    reset() {
        this.collisionEnabled = true;
        this.coinCollectionEnabled = true;
        this.clearDebugBoxes();
        
        console.log('Physics system reset!');
    }
    
    /**
     * Calculate jump trajectory
     */
    calculateJumpHeight(jumpProgress, jumpHeight) {
        return Math.sin(jumpProgress) * jumpHeight;
    }
    
    /**
     * Calculate slide duration based on game speed
     */
    calculateSlideDuration(baseDuration, gameSpeed) {
        // Slide duration decreases as game speeds up
        return Math.max(baseDuration * 0.7, baseDuration * (10 / gameSpeed));
    }
}

// Export the class
window.Physics = Physics;