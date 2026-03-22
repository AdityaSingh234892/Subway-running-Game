/**
 * Player Module - Handles player character, controls, and animations
 */

class Player {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.scene = gameManager.getScene();
        
        // Player properties
        this.mesh = null;
        this.bodyMesh = null; // Reference to the body mesh for material changes
        this.position = new THREE.Vector3(0, 1, 0);
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.targetX = 0; // Target lane position
        this.currentX = 0; // Current x position
        
        // Player state
        this.isJumping = false;
        this.isSliding = false;
        this.isOnGround = true;
        this.jumpHeight = 5;
        this.jumpSpeed = 15;
        this.jumpProgress = 0;
        this.slideDuration = 0.8;
        this.slideTimer = 0;
        
        // Player dimensions
        this.height = 3;
        this.width = 1;
        this.depth = 1;
        
        // Animation properties
        this.rotationSpeed = 5;
        this.bobAmount = 0.1;
        this.bobSpeed = 10;
        this.bobTime = 0;
        
        // Lane movement
        this.laneChangeSpeed = 10;
        this.isChangingLane = false;
        
        // Create the player
        this.createPlayer();
    }
    
    /**
     * Create the player 3D model
     */
    createPlayer() {
        // Create a group to hold all player parts
        this.mesh = new THREE.Group();
        
        // Body (main capsule)
        // Using CylinderGeometry instead of CapsuleGeometry (not available in Three.js r128)
        const bodyGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1.5, 8, 1);
        const bodyMaterial = new THREE.MeshPhongMaterial({
            color: 0x00aaff,
            shininess: 30,
            specular: 0x444444
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.castShadow = true;
        body.receiveShadow = true;
        body.position.y = 0.8;
        this.mesh.add(body);
        this.bodyMesh = body; // Store reference for collision effects
        
        // Head
        const headGeometry = new THREE.SphereGeometry(0.6, 16, 16);
        const headMaterial = new THREE.MeshPhongMaterial({
            color: 0xffccaa,
            shininess: 10
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.castShadow = true;
        head.position.y = 2.2;
        this.mesh.add(head);
        
        // Eyes
        const eyeGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const eyeMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.2, 2.3, 0.5);
        this.mesh.add(leftEye);
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.2, 2.3, 0.5);
        this.mesh.add(rightEye);
        
        // Pupils
        const pupilGeometry = new THREE.SphereGeometry(0.05, 8, 8);
        const pupilMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
        
        const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
        leftPupil.position.set(-0.2, 2.3, 0.6);
        this.mesh.add(leftPupil);
        
        const rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
        rightPupil.position.set(0.2, 2.3, 0.6);
        this.mesh.add(rightPupil);
        
        // Arms
        const armGeometry = new THREE.CylinderGeometry(0.15, 0.15, 1.2, 8);
        const armMaterial = new THREE.MeshPhongMaterial({ color: 0x00aaff });
        
        const leftArm = new THREE.Mesh(armGeometry, armMaterial);
        leftArm.position.set(-0.8, 1.5, 0);
        leftArm.rotation.z = Math.PI / 6;
        this.mesh.add(leftArm);
        
        const rightArm = new THREE.Mesh(armGeometry, armMaterial);
        rightArm.position.set(0.8, 1.5, 0);
        rightArm.rotation.z = -Math.PI / 6;
        this.mesh.add(rightArm);
        
        // Legs
        const legGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1.5, 8);
        const legMaterial = new THREE.MeshPhongMaterial({ color: 0x0066cc });
        
        const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        leftLeg.position.set(-0.3, 0, 0);
        this.mesh.add(leftLeg);
        
        const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        rightLeg.position.set(0.3, 0, 0);
        this.mesh.add(rightLeg);
        
        // Backpack
        const backpackGeometry = new THREE.BoxGeometry(0.8, 1, 0.4);
        const backpackMaterial = new THREE.MeshPhongMaterial({ color: 0xff6600 });
        const backpack = new THREE.Mesh(backpackGeometry, backpackMaterial);
        backpack.position.set(0, 1.5, -0.5);
        backpack.castShadow = true;
        this.mesh.add(backpack);
        
        // Set initial position and scale
        this.mesh.position.copy(this.position);
        this.mesh.scale.set(1, 1, 1);
        
        // Add to scene
        this.scene.add(this.mesh);
        
        console.log('Player created successfully!');
    }
    
    /**
     * Update player state each frame
     */
    update(deltaTime) {
        // Update lane movement
        this.updateLaneMovement(deltaTime);
        
        // Update jumping physics
        this.updateJump(deltaTime);
        
        // Update sliding
        this.updateSlide(deltaTime);
        
        // Update running animation
        this.updateAnimation(deltaTime);
        
        // Apply position to mesh
        this.mesh.position.copy(this.position);
        
        // Update target X based on current lane
        const targetLanePos = this.gameManager.getCurrentLanePosition();
        this.targetX = targetLanePos;
    }
    
    /**
     * Smooth lane movement
     */
    updateLaneMovement(deltaTime) {
        // Smoothly move toward target X position
        const diff = this.targetX - this.currentX;
        const moveAmount = Math.sign(diff) * Math.min(this.laneChangeSpeed * deltaTime, Math.abs(diff));
        this.currentX += moveAmount;
        this.position.x = this.currentX;
        
        // Rotate slightly when changing lanes
        if (Math.abs(diff) > 0.1) {
            const targetRotation = -diff * 0.1;
            this.mesh.rotation.y += (targetRotation - this.mesh.rotation.y) * 5 * deltaTime;
        } else {
            // Return to normal rotation
            this.mesh.rotation.y += (0 - this.mesh.rotation.y) * 5 * deltaTime;
        }
    }
    
    /**
     * Handle jumping physics
     */
    updateJump(deltaTime) {
        if (this.isJumping) {
            this.jumpProgress += deltaTime * this.jumpSpeed;
            
            // Parabolic jump trajectory
            const t = this.jumpProgress;
            const height = Math.sin(t) * this.jumpHeight;
            
            if (t < Math.PI) {
                // Still in jump
                this.position.y = 1 + height;
                this.isOnGround = false;
            } else {
                // Jump completed
                this.isJumping = false;
                this.jumpProgress = 0;
                this.position.y = 1;
                this.isOnGround = true;
            }
        }
    }
    
    /**
     * Handle sliding animation
     */
    updateSlide(deltaTime) {
        if (this.isSliding) {
            this.slideTimer += deltaTime;
            
            if (this.slideTimer >= this.slideDuration) {
                // End slide
                this.isSliding = false;
                this.slideTimer = 0;
                this.mesh.scale.y = 1;
                this.mesh.position.y = this.position.y;
                this.height = 3;
            } else {
                // Apply slide squash
                const progress = this.slideTimer / this.slideDuration;
                const squash = 0.5 + 0.5 * Math.sin(progress * Math.PI);
                this.mesh.scale.y = squash;
                this.mesh.position.y = this.position.y * squash;
                this.height = 3 * squash;
            }
        }
    }
    
    /**
     * Update running and idle animations
     */
    updateAnimation(deltaTime) {
        // Running bob animation
        if (this.isOnGround && !this.isSliding) {
            this.bobTime += deltaTime * this.bobSpeed;
            const bobOffset = Math.sin(this.bobTime) * this.bobAmount;
            this.mesh.position.y = this.position.y + bobOffset;
            
            // Arm swing animation
            const armSwing = Math.sin(this.bobTime * 2) * 0.5;
            this.mesh.children.forEach((child, index) => {
                if (child.name === 'leftArm' || index === 6) { // Left arm index
                    child.rotation.z = Math.PI / 6 + armSwing;
                }
                if (child.name === 'rightArm' || index === 7) { // Right arm index
                    child.rotation.z = -Math.PI / 6 - armSwing;
                }
            });
        }
        
        // Reset scale if not sliding
        if (!this.isSliding) {
            this.mesh.scale.x = 1;
            this.mesh.scale.z = 1;
        }
    }
    
    /**
     * Move player to left lane
     */
    moveLeft() {
        if (this.isJumping) return; // Can't change lanes while jumping
        
        const currentLane = this.gameManager.getCurrentLane();
        if (currentLane > 0) {
            this.gameManager.changeLane(currentLane - 1);
        }
    }
    
    /**
     * Move player to right lane
     */
    moveRight() {
        if (this.isJumping) return; // Can't change lanes while jumping
        
        const currentLane = this.gameManager.getCurrentLane();
        if (currentLane < 2) {
            this.gameManager.changeLane(currentLane + 1);
        }
    }
    
    /**
     * Make player jump
     */
    jump() {
        if (this.isJumping || this.isSliding) return;
        
        this.isJumping = true;
        this.jumpProgress = 0;
        this.isOnGround = false;
        
        // Add a little visual feedback
        this.mesh.scale.y = 1.1;
        this.mesh.scale.x = 0.9;
        
        // Play jump sound (would be implemented with audio)
        console.log('Player jumped!');
    }
    
    /**
     * Make player slide
     */
    slide() {
        if (this.isJumping || this.isSliding) return;
        
        this.isSliding = true;
        this.slideTimer = 0;
        this.height = 1.5; // Reduced height for collision
        
        // Visual feedback
        this.mesh.scale.y = 0.5;
        this.mesh.scale.x = 1.2;
        
        console.log('Player sliding!');
    }
    
    /**
     * Get player position
     */
    getPosition() {
        return this.position.clone();
    }
    
    /**
     * Get player mesh for collision detection
     */
    getMesh() {
        return this.mesh;
    }
    
    /**
     * Get player bounding box
     */
    getBoundingBox() {
        if (!this.mesh) return null;
        
        const box = new THREE.Box3().setFromObject(this.mesh);
        
        // Adjust for sliding
        if (this.isSliding) {
            box.min.y += 1; // Lower the bottom of the box
        }
        
        return box;
    }
    
    /**
     * Get player height (adjusted for sliding/jumping)
     */
    getHeight() {
        return this.height;
    }
    
    /**
     * Check if player is vulnerable (can be hit)
     */
    isVulnerable() {
        return !this.isJumping && !this.isSliding;
    }
    
    /**
     * Reset player to initial state
     */
    reset() {
        this.position.set(0, 1, 0);
        this.currentX = 0;
        this.targetX = 0;
        this.isJumping = false;
        this.isSliding = false;
        this.isOnGround = true;
        this.jumpProgress = 0;
        this.slideTimer = 0;
        
        if (this.mesh) {
            this.mesh.position.copy(this.position);
            this.mesh.rotation.set(0, 0, 0);
            this.mesh.scale.set(1, 1, 1);
        }
        
        // Reset lane to center
        this.gameManager.changeLane(1);
    }
    
    /**
     * Handle collision with obstacle
     */
    onCollision() {
        // Ensure bodyMesh reference exists
        if (!this.bodyMesh && this.mesh) {
            // Try to find the body mesh among children (first child is body)
            const body = this.mesh.children.find(child => child.geometry && child.geometry.type === 'CylinderGeometry');
            if (body) this.bodyMesh = body;
        }
        
        // Visual feedback for collision (change body color)
        try {
            if (this.bodyMesh && this.bodyMesh.material) {
                this.bodyMesh.material.color.setHex(0xff0000);
            }
        } catch (e) {
            console.warn('Could not set collision color:', e);
        }
        
        // Shake effect
        const originalPos = this.mesh.position.clone();
        let shakeCount = 0;
        const shakeInterval = setInterval(() => {
            this.mesh.position.x = originalPos.x + (Math.random() - 0.5) * 0.5;
            this.mesh.position.y = originalPos.y + (Math.random() - 0.5) * 0.5;
            shakeCount++;
            
            if (shakeCount >= 10) {
                clearInterval(shakeInterval);
                this.mesh.position.copy(originalPos);
                // Reset body color
                try {
                    if (this.bodyMesh && this.bodyMesh.material) {
                        this.bodyMesh.material.color.setHex(0x00aaff);
                    }
                } catch (e) {
                    console.warn('Could not reset collision color:', e);
                }
            }
        }, 50);
        
        console.log('Player collision!');
    }
}

// Export the class
window.Player = Player;