/**
 * Obstacle Manager - Handles generation and management of obstacles and coins
 */

class ObstacleManager {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.scene = gameManager.getScene();
        
        // Obstacle properties
        this.obstacles = [];
        this.coins = [];
        this.activeObstacles = [];
        this.activeCoins = [];
        
        // Generation parameters
        this.obstacleSpawnRate = 1.5; // seconds between obstacles
        this.coinSpawnRate = 0.8; // seconds between coin groups
        this.obstacleTimer = 0;
        this.coinTimer = 0;
        
        // Difficulty scaling
        this.difficultyLevel = 1;
        this.maxObstacles = 15;
        this.maxCoins = 30;
        
        // Lane positions
        this.lanePositions = [-3, 0, 3];
        
        // Obstacle types
        this.obstacleTypes = [
            { name: 'train', width: 2, height: 3, depth: 8, color: 0xcc3333 },
            { name: 'barrier', width: 1, height: 2, depth: 1, color: 0xffcc00 },
            { name: 'signal', width: 0.5, height: 4, depth: 0.5, color: 0x00cc00 },
            { name: 'crate', width: 1.5, height: 1.5, depth: 1.5, color: 0x8B4513 }
        ];
        
        // Pre-create obstacle pool for performance
        this.createObstaclePool();
        this.createCoinPool();
        
        console.log('Obstacle Manager initialized!');
    }
    
    /**
     * Create a pool of obstacle meshes for reuse
     */
    createObstaclePool() {
        this.obstaclePool = [];
        
        for (let i = 0; i < this.maxObstacles; i++) {
            const typeIndex = i % this.obstacleTypes.length;
            const type = this.obstacleTypes[typeIndex];
            
            let geometry;
            if (type.name === 'train') {
                geometry = new THREE.BoxGeometry(type.width, type.height, type.depth);
            } else if (type.name === 'barrier') {
                geometry = new THREE.CylinderGeometry(type.width/2, type.width/2, type.height, 8);
            } else if (type.name === 'signal') {
                // Using CylinderGeometry instead of CapsuleGeometry (not available in Three.js r128)
                geometry = new THREE.CylinderGeometry(type.width/2, type.width/2, type.height, 8, 1);
            } else {
                geometry = new THREE.BoxGeometry(type.width, type.height, type.depth);
            }
            
            const material = new THREE.MeshPhongMaterial({
                color: type.color,
                shininess: 30,
                specular: 0x444444
            });
            
            const mesh = new THREE.Mesh(geometry, material);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            mesh.visible = false;
            mesh.userData = {
                type: type.name,
                width: type.width,
                height: type.height,
                depth: type.depth,
                isActive: false
            };
            
            this.scene.add(mesh);
            this.obstaclePool.push(mesh);
        }
    }
    
    /**
     * Create a pool of coin meshes for reuse
     */
    createCoinPool() {
        this.coinPool = [];
        
        for (let i = 0; i < this.maxCoins; i++) {
            // Coin geometry (flat cylinder)
            const geometry = new THREE.CylinderGeometry(0.5, 0.5, 0.1, 16);
            geometry.computeBoundingSphere(); // Ensure bounding sphere exists for collision detection
            const material = new THREE.MeshPhongMaterial({
                color: 0xFFD700,
                emissive: 0x333300,
                shininess: 100,
                specular: 0xFFFF00
            });
            
            const mesh = new THREE.Mesh(geometry, material);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            mesh.visible = false;
            mesh.userData = {
                value: 10,
                isActive: false,
                rotationSpeed: 5 + Math.random() * 3
            };
            
            this.scene.add(mesh);
            this.coinPool.push(mesh);
        }
    }
    
    /**
     * Update obstacles and coins each frame
     */
    update(deltaTime, gameSpeed) {
        // Update timers
        this.obstacleTimer += deltaTime;
        this.coinTimer += deltaTime;
        
        // Spawn obstacles based on timer and difficulty
        if (this.obstacleTimer >= this.obstacleSpawnRate / this.difficultyLevel) {
            this.spawnObstacle();
            this.obstacleTimer = 0;
        }
        
        // Spawn coins
        if (this.coinTimer >= this.coinSpawnRate) {
            this.spawnCoinGroup();
            this.coinTimer = 0;
        }
        
        // Update active obstacles
        this.updateActiveObstacles(deltaTime, gameSpeed);
        
        // Update active coins
        this.updateActiveCoins(deltaTime, gameSpeed);
        
        // Increase difficulty over time
        this.difficultyLevel = 1 + (gameSpeed - 10) * 0.05;
    }
    
    /**
     * Spawn a new obstacle at a random lane
     */
    spawnObstacle() {
        // Find an available obstacle from pool
        const obstacle = this.obstaclePool.find(obj => !obj.userData.isActive);
        if (!obstacle) return;
        
        // Random lane (0, 1, or 2)
        const lane = Math.floor(Math.random() * 3);
        const x = this.lanePositions[lane];
        
        // Random z position (start off-screen)
        const z = -50 - Math.random() * 20;
        
        // Set position and make visible
        obstacle.position.set(x, obstacle.userData.height / 2, z);
        obstacle.visible = true;
        obstacle.userData.isActive = true;
        
        // Add to active list
        this.activeObstacles.push(obstacle);
        
        // Random rotation for variety
        if (obstacle.userData.type === 'crate') {
            obstacle.rotation.y = Math.random() * Math.PI;
        }
    }
    
    /**
     * Spawn a group of coins (1-3 coins in a row)
     */
    spawnCoinGroup() {
        const coinCount = 1 + Math.floor(Math.random() * 3);
        const lane = Math.floor(Math.random() * 3);
        const startZ = -40 - Math.random() * 15;
        
        for (let i = 0; i < coinCount; i++) {
            const coin = this.coinPool.find(obj => !obj.userData.isActive);
            if (!coin) continue;
            
            const x = this.lanePositions[lane];
            const z = startZ - i * 3; // Space coins out
            
            coin.position.set(x, 2, z);
            coin.visible = true;
            coin.userData.isActive = true;
            
            this.activeCoins.push(coin);
        }
    }
    
    /**
     * Update active obstacles (move them toward player)
     */
    updateActiveObstacles(deltaTime, gameSpeed) {
        for (let i = this.activeObstacles.length - 1; i >= 0; i--) {
            const obstacle = this.activeObstacles[i];
            
            // Move obstacle toward player
            obstacle.position.z += gameSpeed * deltaTime;
            
            // Remove if far behind player
            if (obstacle.position.z > 20) {
                this.deactivateObstacle(i);
            }
            
            // Add some animation
            if (obstacle.userData.type === 'train') {
                // Train wheels rotation
                obstacle.rotation.x += deltaTime * 2;
            }
        }
    }
    
    /**
     * Update active coins (move and animate)
     */
    updateActiveCoins(deltaTime, gameSpeed) {
        for (let i = this.activeCoins.length - 1; i >= 0; i--) {
            const coin = this.activeCoins[i];
            
            // Move coin toward player
            coin.position.z += gameSpeed * deltaTime;
            
            // Rotate coin
            coin.rotation.y += deltaTime * coin.userData.rotationSpeed;
            
            // Bob up and down
            coin.position.y = 2 + Math.sin(Date.now() * 0.003 + i) * 0.5;
            
            // Remove if far behind player
            if (coin.position.z > 20) {
                this.deactivateCoin(i);
            }
        }
    }
    
    /**
     * Deactivate an obstacle and return it to pool
     */
    deactivateObstacle(index) {
        const obstacle = this.activeObstacles[index];
        obstacle.visible = false;
        obstacle.userData.isActive = false;
        this.activeObstacles.splice(index, 1);
    }
    
    /**
     * Deactivate a coin and return it to pool
     */
    deactivateCoin(index) {
        const coin = this.activeCoins[index];
        coin.visible = false;
        coin.userData.isActive = false;
        this.activeCoins.splice(index, 1);
    }
    
    /**
     * Get all active obstacles for collision detection
     */
    getActiveObstacles() {
        return this.activeObstacles;
    }
    
    /**
     * Get all active coins for collision detection
     */
    getActiveCoins() {
        return this.activeCoins;
    }
    
    /**
     * Collect a coin (called when player collides with coin)
     */
    collectCoin(coin) {
        const index = this.activeCoins.indexOf(coin);
        if (index !== -1) {
            // Visual effect
            this.createCoinCollectionEffect(coin.position);
            
            // Deactivate coin
            this.deactivateCoin(index);
            
            // Update score
            if (window.game) {
                window.game.updateCoins(1);
                window.game.updateScore(coin.userData.value);
                
                // Create visual feedback in UI
                this.showCoinFeedback();
            }
            
            return true;
        }
        return false;
    }
    
    /**
     * Create visual effect when coin is collected
     */
    createCoinCollectionEffect(position) {
        // Create a particle-like effect
        const geometry = new THREE.SphereGeometry(0.3, 8, 8);
        const material = new THREE.MeshBasicMaterial({
            color: 0xFFD700,
            transparent: true,
            opacity: 0.8
        });
        
        const particle = new THREE.Mesh(geometry, material);
        particle.position.copy(position);
        this.scene.add(particle);
        
        // Animate and remove
        let scale = 1;
        const animate = () => {
            scale += 0.1;
            particle.scale.set(scale, scale, scale);
            material.opacity -= 0.05;
            
            if (material.opacity > 0) {
                requestAnimationFrame(animate);
            } else {
                this.scene.remove(particle);
            }
        };
        
        animate();
    }
    
    /**
     * Show visual feedback in UI for coin collection
     */
    showCoinFeedback() {
        // This would typically create a floating "+10" text
        // For now, we'll just log
        console.log('Coin collected!');
    }
    
    /**
     * Reset all obstacles and coins
     */
    reset() {
        // Deactivate all active obstacles
        for (let i = this.activeObstacles.length - 1; i >= 0; i--) {
            this.deactivateObstacle(i);
        }
        
        // Deactivate all active coins
        for (let i = this.activeCoins.length - 1; i >= 0; i--) {
            this.deactivateCoin(i);
        }
        
        // Reset timers and difficulty
        this.obstacleTimer = 0;
        this.coinTimer = 0;
        this.difficultyLevel = 1;
        
        console.log('Obstacle Manager reset!');
    }
    
    /**
     * Get obstacle bounding box for collision detection
     */
    getObstacleBoundingBox(obstacle) {
        return new THREE.Box3().setFromObject(obstacle);
    }
    
    /**
     * Get coin bounding sphere for collision detection
     */
    getCoinBoundingSphere(coin) {
        if (!coin.geometry.boundingSphere) {
            coin.geometry.computeBoundingSphere();
        }
        const sphere = coin.geometry.boundingSphere.clone();
        sphere.applyMatrix4(coin.matrixWorld);
        return sphere;
    }
}

// Export the class
window.ObstacleManager = ObstacleManager;