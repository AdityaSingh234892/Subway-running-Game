/**
 * Game Manager - Core Three.js engine and game loop
 * Manages the scene, camera, renderer, and main game loop
 */

class GameManager {
    constructor() {
        // Three.js core components
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        
        // Game modules
        this.player = null;
        this.environment = null;
        this.obstacleManager = null;
        this.uiManager = null;
        this.physics = null;
        
        // Game state
        this.isRunning = false;
        this.lastTime = 0;
        this.deltaTime = 0;
        this.gameSpeed = 10.0; // Base movement speed
        this.speedIncreaseRate = 0.0001; // How fast speed increases over time
        
        // Lane positions (x coordinates for left, center, right)
        this.lanePositions = [-3, 0, 3];
        this.currentLane = 1; // Center lane (index 1)
        
        // Track segments for infinite scrolling
        this.trackSegments = [];
        this.segmentLength = 50;
        this.segmentsAhead = 5;
        
        // Performance tracking
        this.frameCount = 0;
        this.fps = 60;
        
        // Debug mode
        this.debug = false;
    }
    
    /**
     * Initialize Three.js scene, camera, and renderer
     */
    init() {
        console.log('Initializing Game Manager...');
        
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x111122);
        this.scene.fog = new THREE.Fog(0x111122, 10, 100);
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            75, // Field of view
            window.innerWidth / window.innerHeight, // Aspect ratio
            0.1, // Near clipping plane
            1000 // Far clipping plane
        );
        this.camera.position.set(0, 5, 10);
        this.camera.lookAt(0, 0, 0);
        
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('gameCanvas'),
            antialias: true,
            alpha: false
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Add lighting
        this.setupLighting();
        
        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
        
        // Start game loop
        this.isRunning = true;
        this.lastTime = performance.now();
        this.animate();
        
        console.log('Game Manager initialized successfully!');
    }
    
    /**
     * Set references to other game modules
     */
    setModules(player, environment, obstacleManager, uiManager, physics) {
        this.player = player;
        this.environment = environment;
        this.obstacleManager = obstacleManager;
        this.uiManager = uiManager;
        this.physics = physics;
    }
    
    /**
     * Setup lighting for the scene
     */
    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);
        
        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.camera.left = -20;
        directionalLight.shadow.camera.right = 20;
        directionalLight.shadow.camera.top = 20;
        directionalLight.shadow.camera.bottom = -20;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
        
        // Point light for player
        const playerLight = new THREE.PointLight(0x00aaff, 0.5, 20);
        playerLight.position.set(0, 3, 0);
        this.scene.add(playerLight);
        
        // Add some colored lights for atmosphere
        const leftLight = new THREE.PointLight(0xff4444, 0.3, 30);
        leftLight.position.set(-15, 5, -20);
        this.scene.add(leftLight);
        
        const rightLight = new THREE.PointLight(0x4444ff, 0.3, 30);
        rightLight.position.set(15, 5, -20);
        this.scene.add(rightLight);
    }
    
    /**
     * Main game loop using requestAnimationFrame
     */
    animate(currentTime = 0) {
        // Calculate delta time
        this.deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
        this.lastTime = currentTime;
        
        // Calculate FPS
        this.frameCount++;
        if (this.frameCount % 60 === 0) {
            this.fps = Math.round(1 / this.deltaTime);
            if (this.debug) console.log(`FPS: ${this.fps}`);
        }
        
        // Only update if game is running
        if (this.isRunning) {
            this.update(this.deltaTime);
        }
        
        // Render the scene
        this.render();
        
        // Continue the loop
        requestAnimationFrame((time) => this.animate(time));
    }
    
    /**
     * Update game logic
     */
    update(deltaTime) {
        // Increase game speed over time
        this.gameSpeed += this.speedIncreaseRate * deltaTime * 60;
        
        // Update speed multiplier in UI
        if (window.game) {
            window.game.updateSpeedMultiplier(this.gameSpeed / 10);
            window.game.updateDistance(this.gameSpeed * deltaTime * 2);
        }
        
        // Update player
        if (this.player) {
            this.player.update(deltaTime);
        }
        
        // Update environment (infinite track)
        if (this.environment) {
            this.environment.update(deltaTime, this.gameSpeed);
        }
        
        // Update obstacles and coins
        if (this.obstacleManager) {
            this.obstacleManager.update(deltaTime, this.gameSpeed);
        }
        
        // Update camera position to follow player
        this.updateCamera(deltaTime);
        
        // Check collisions
        if (this.physics && this.player && this.obstacleManager) {
            this.physics.checkCollisions(this.player, this.obstacleManager);
        }
    }
    
    /**
     * Update camera to follow player with smooth damping
     */
    updateCamera(deltaTime) {
        if (!this.player || !this.camera) return;
        
        const playerPosition = this.player.getPosition();
        
        // Target camera position (behind and above player)
        const targetX = playerPosition.x * 0.3;
        const targetY = playerPosition.y + 4;
        const targetZ = playerPosition.z + 12;
        
        // Smooth interpolation
        const lerpFactor = 5.0 * deltaTime;
        this.camera.position.x += (targetX - this.camera.position.x) * lerpFactor;
        this.camera.position.y += (targetY - this.camera.position.y) * lerpFactor;
        this.camera.position.z += (targetZ - this.camera.position.z) * lerpFactor;
        
        // Make camera look slightly ahead of player
        const lookAtX = playerPosition.x * 0.1;
        const lookAtY = playerPosition.y + 1;
        const lookAtZ = playerPosition.z - 5;
        
        this.camera.lookAt(lookAtX, lookAtY, lookAtZ);
    }
    
    /**
     * Render the scene
     */
    render() {
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }
    
    /**
     * Handle window resize
     */
    onWindowResize() {
        if (!this.camera || !this.renderer) return;
        
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    /**
     * Get lane position by index
     */
    getLanePosition(laneIndex) {
        if (laneIndex >= 0 && laneIndex < this.lanePositions.length) {
            return this.lanePositions[laneIndex];
        }
        return this.lanePositions[1]; // Default to center
    }
    
    /**
     * Change player lane
     */
    changeLane(newLane) {
        if (newLane >= 0 && newLane < this.lanePositions.length) {
            this.currentLane = newLane;
            
            // Update lane indicator in UI
            if (window.game) {
                window.game.updateLaneIndicator(newLane);
            }
            
            return true;
        }
        return false;
    }
    
    /**
     * Get current lane index
     */
    getCurrentLane() {
        return this.currentLane;
    }
    
    /**
     * Get current lane position (x coordinate)
     */
    getCurrentLanePosition() {
        return this.getLanePosition(this.currentLane);
    }
    
    /**
     * Handle game state changes
     */
    onGameStateChange(newState) {
        switch (newState) {
            case 'playing':
                this.isRunning = true;
                break;
            case 'paused':
            case 'game_over':
            case 'start_menu':
                this.isRunning = false;
                break;
        }
    }
    
    /**
     * Reset game to initial state
     */
    reset() {
        this.gameSpeed = 10.0;
        this.currentLane = 1;
        
        // Reset modules
        if (this.player) this.player.reset();
        if (this.environment) this.environment.reset();
        if (this.obstacleManager) this.obstacleManager.reset();
        
        this.isRunning = true;
    }
    
    /**
     * Get the Three.js scene
     */
    getScene() {
        return this.scene;
    }
    
    /**
     * Get the camera
     */
    getCamera() {
        return this.camera;
    }
    
    /**
     * Get the renderer
     */
    getRenderer() {
        return this.renderer;
    }
    
    /**
     * Get current game speed
     */
    getGameSpeed() {
        return this.gameSpeed;
    }
    
    /**
     * Toggle debug mode
     */
    toggleDebug() {
        this.debug = !this.debug;
        console.log(`Debug mode: ${this.debug ? 'ON' : 'OFF'}`);
    }
}

// Export the class
window.GameManager = GameManager;