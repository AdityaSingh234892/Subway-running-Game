/**
 * Environment Module - Creates and manages the 3D game environment
 * Includes infinite track, background, and scenery
 */

class Environment {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.scene = gameManager.getScene();
        
        // Track properties
        this.trackSegments = [];
        this.trackLength = 500; // Much longer segments for seamless continuity
        this.segmentsAhead = 8; // More segments ahead to reduce visible recycling
        this.segmentSpacing = this.trackLength - 0.5; // Slight overlap to eliminate gaps
        
        // Background elements
        this.backgroundBuildings = [];
        this.tunnelSegments = [];
        this.skybox = null;
        
        // Environment colors
        this.colors = {
            track: 0x333333,
            rail: 0x888888,
            tie: 0x8B4513,
            ground: 0x226622,
            building1: 0x555577,
            building2: 0x775555,
            building3: 0x557755
        };
        
        // Create the environment
        this.createEnvironment();
        
        console.log('Environment created successfully!');
    }
    
    /**
     * Create the initial game environment
     */
    createEnvironment() {
        // Create skybox
        this.createSkybox();
        
        // Create ground plane
        this.createGround();
        
        // Create initial track segments
        for (let i = 0; i < this.segmentsAhead; i++) {
            this.createTrackSegment(i * this.segmentSpacing);
        }
        
        // Create background buildings
        this.createBackgroundBuildings();
        
        // Create tunnel entrance
        this.createTunnel();
    }
    
    /**
     * Create a simple skybox using a gradient background
     */
    createSkybox() {
        // Create a large sphere for sky
        const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
        const skyMaterial = new THREE.MeshBasicMaterial({
            color: 0x87CEEB,
            side: THREE.BackSide,
            fog: false
        });
        
        this.skybox = new THREE.Mesh(skyGeometry, skyMaterial);
        this.scene.add(this.skybox);
        
        // Add some clouds (simple planes)
        for (let i = 0; i < 10; i++) {
            const cloudGeometry = new THREE.PlaneGeometry(30, 10);
            const cloudMaterial = new THREE.MeshBasicMaterial({
                color: 0xFFFFFF,
                transparent: true,
                opacity: 0.7,
                side: THREE.DoubleSide
            });
            
            const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
            cloud.position.set(
                (Math.random() - 0.5) * 200,
                80 + Math.random() * 40,
                -100 - Math.random() * 200
            );
            cloud.rotation.x = Math.PI / 2;
            this.scene.add(cloud);
        }
    }
    
    /**
     * Create ground plane
     */
    createGround() {
        const groundGeometry = new THREE.PlaneGeometry(1000, 1000);
        const groundMaterial = new THREE.MeshPhongMaterial({
            color: this.colors.ground,
            shininess: 5
        });
        
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.5;
        ground.receiveShadow = true;
        
        this.scene.add(ground);
        
        // Add some grass texture variation
        const grassGeometry = new THREE.PlaneGeometry(200, 1000);
        const grassMaterial = new THREE.MeshPhongMaterial({
            color: 0x44AA44,
            side: THREE.DoubleSide
        });
        
        const leftGrass = new THREE.Mesh(grassGeometry, grassMaterial);
        leftGrass.rotation.x = -Math.PI / 2;
        leftGrass.position.set(-60, -0.4, 0);
        this.scene.add(leftGrass);
        
        const rightGrass = new THREE.Mesh(grassGeometry, grassMaterial);
        rightGrass.rotation.x = -Math.PI / 2;
        rightGrass.position.set(60, -0.4, 0);
        this.scene.add(rightGrass);
    }
    
    /**
     * Create a single track segment
     */
    createTrackSegment(zPosition) {
        const segmentGroup = new THREE.Group();
        
        // Track base
        const trackGeometry = new THREE.BoxGeometry(10, 0.5, this.trackLength);
        const trackMaterial = new THREE.MeshPhongMaterial({
            color: this.colors.track,
            shininess: 10
        });
        
        const track = new THREE.Mesh(trackGeometry, trackMaterial);
        track.position.y = 0;
        track.receiveShadow = true;
        segmentGroup.add(track);
        
        // Rails (two parallel rails)
        const railGeometry = new THREE.BoxGeometry(0.2, 0.3, this.trackLength);
        const railMaterial = new THREE.MeshPhongMaterial({
            color: this.colors.rail,
            shininess: 50
        });
        
        const leftRail = new THREE.Mesh(railGeometry, railMaterial);
        leftRail.position.set(-1.5, 0.25, 0);
        segmentGroup.add(leftRail);
        
        const rightRail = new THREE.Mesh(railGeometry, railMaterial);
        rightRail.position.set(1.5, 0.25, 0);
        segmentGroup.add(rightRail);
        
        // Railroad ties (sleepers)
        const tieGeometry = new THREE.BoxGeometry(3, 0.2, 0.5);
        const tieMaterial = new THREE.MeshPhongMaterial({
            color: this.colors.tie
        });
        
        const tieCount = Math.floor(this.trackLength / 4); // Fewer ties for better performance
        for (let i = 0; i < tieCount; i++) {
            const tie = new THREE.Mesh(tieGeometry, tieMaterial);
            const tieZ = (i - tieCount / 2) * 4; // Spacing increased to 4 units
            tie.position.set(0, 0.1, tieZ);
            tie.receiveShadow = true;
            segmentGroup.add(tie);
        }
        
        // Lane markers
        this.createLaneMarkers(segmentGroup);
        
        // Position the segment
        segmentGroup.position.z = zPosition;
        this.scene.add(segmentGroup);
        
        // Store reference
        this.trackSegments.push({
            group: segmentGroup,
            z: zPosition,
            length: this.trackLength
        });
        
        return segmentGroup;
    }
    
    /**
     * Create lane markers on the track
     */
    createLaneMarkers(segmentGroup) {
        const markerGeometry = new THREE.BoxGeometry(0.5, 0.1, 0.5);
        const markerMaterial = new THREE.MeshPhongMaterial({
            color: 0xFFFF00,
            emissive: 0x333300
        });
        
        // Create markers for each lane
        const lanePositions = [-3, 0, 3];
        const markerCount = 20;
        
        for (const laneX of lanePositions) {
            for (let i = 0; i < markerCount; i++) {
                const marker = new THREE.Mesh(markerGeometry, markerMaterial);
                const markerZ = (i - markerCount / 2) * (this.trackLength / markerCount);
                marker.position.set(laneX, 0.3, markerZ);
                segmentGroup.add(marker);
            }
        }
    }
    
    /**
     * Create background buildings
     */
    createBackgroundBuildings() {
        const buildingCount = 20;
        
        for (let i = 0; i < buildingCount; i++) {
            // Random building size
            const width = 5 + Math.random() * 15;
            const height = 10 + Math.random() * 40;
            const depth = 5 + Math.random() * 10;
            
            // Choose random color
            const colorKeys = Object.keys(this.colors).filter(k => k.startsWith('building'));
            const colorKey = colorKeys[Math.floor(Math.random() * colorKeys.length)];
            const color = this.colors[colorKey];
            
            // Create building
            const geometry = new THREE.BoxGeometry(width, height, depth);
            const material = new THREE.MeshPhongMaterial({
                color: color,
                shininess: 5
            });
            
            const building = new THREE.Mesh(geometry, material);
            
            // Position building to the sides and behind
            const side = Math.random() > 0.5 ? 1 : -1;
            const x = side * (30 + Math.random() * 40);
            const y = height / 2;
            const z = -100 - Math.random() * 200;
            
            building.position.set(x, y, z);
            building.castShadow = true;
            building.receiveShadow = true;
            
            // Add windows
            this.addWindowsToBuilding(building, width, height, depth);
            
            this.scene.add(building);
            this.backgroundBuildings.push(building);
        }
    }
    
    /**
     * Add window details to a building
     */
    addWindowsToBuilding(building, width, height, depth) {
        const windowGroup = new THREE.Group();
        
        const windowGeometry = new THREE.BoxGeometry(0.8, 1.2, 0.1);
        const windowMaterial = new THREE.MeshPhongMaterial({
            color: 0x88CCFF,
            emissive: 0x001133
        });
        
        // Calculate window grid
        const rows = Math.floor(height / 3);
        const cols = Math.floor(width / 2);
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const window = new THREE.Mesh(windowGeometry, windowMaterial);
                const x = (col - cols/2) * 2 + 1;
                const y = (row - rows/2) * 3 + 1.5;
                const z = depth / 2 + 0.1;
                
                window.position.set(x, y, z);
                windowGroup.add(window);
            }
        }
        
        // Position window group relative to building
        windowGroup.position.copy(building.position);
        this.scene.add(windowGroup);
    }
    
    /**
     * Create tunnel entrance
     */
    createTunnel() {
        const tunnelGeometry = new THREE.CylinderGeometry(8, 8, 20, 16, 1, true);
        const tunnelMaterial = new THREE.MeshPhongMaterial({
            color: 0x666666,
            side: THREE.DoubleSide
        });
        
        const tunnel = new THREE.Mesh(tunnelGeometry, tunnelMaterial);
        tunnel.position.set(0, 5, -80);
        tunnel.rotation.x = Math.PI / 2;
        this.scene.add(tunnel);
        
        this.tunnelSegments.push(tunnel);
    }
    
    /**
     * Update environment each frame (infinite scrolling)
     */
    update(deltaTime, gameSpeed) {
        // Move track segments toward player
        for (let i = this.trackSegments.length - 1; i >= 0; i--) {
            const segment = this.trackSegments[i];
            segment.z += gameSpeed * deltaTime;
            segment.group.position.z = segment.z;
            
            // If segment is far behind player, recycle it to the front
            if (segment.z > 1000) {
                this.recycleTrackSegment(i);
            }
        }
        
        // Move background buildings
        for (const building of this.backgroundBuildings) {
            building.position.z += gameSpeed * deltaTime * 0.5; // Move slower than track
            
            // Recycle buildings that are far behind
            if (building.position.z > 50) {
                building.position.z = -200 - Math.random() * 100;
                building.position.x = (Math.random() > 0.5 ? 1 : -1) * (30 + Math.random() * 40);
            }
        }
        
        // Move tunnel segments
        for (const tunnel of this.tunnelSegments) {
            tunnel.position.z += gameSpeed * deltaTime;
            
            if (tunnel.position.z > 50) {
                tunnel.position.z = -150;
            }
        }
    }
    
    /**
     * Recycle a track segment to create infinite track
     */
    recycleTrackSegment(index) {
        const segment = this.trackSegments[index];
        
        // Find the farthest segment
        let farthestZ = -Infinity;
        for (const seg of this.trackSegments) {
            if (seg.z > farthestZ) farthestZ = seg.z;
        }
        
        // Move this segment to the front
        segment.z = farthestZ - this.segmentSpacing;
        segment.group.position.z = segment.z;
        
        // Randomize lane markers for variety
        this.randomizeLaneMarkers(segment.group);
    }
    
    /**
     * Randomize lane markers for visual variety
     */
    randomizeLaneMarkers(segmentGroup) {
        // Find and update marker colors
        segmentGroup.children.forEach(child => {
            if (child.material && child.material.color) {
                // Only affect yellow markers (lane markers)
                if (child.material.color.getHex() === 0xFFFF00) {
                    // Occasionally make some markers blink
                    if (Math.random() < 0.3) {
                        child.material.emissive.setHex(0x666600);
                    } else {
                        child.material.emissive.setHex(0x333300);
                    }
                }
            }
        });
    }
    
    /**
     * Reset environment to initial state
     */
    reset() {
        // Reset track segments
        for (let i = 0; i < this.trackSegments.length; i++) {
            const segment = this.trackSegments[i];
            segment.z = i * this.segmentSpacing;
            segment.group.position.z = segment.z;
        }
        
        // Reset background buildings
        for (const building of this.backgroundBuildings) {
            building.position.z = -100 - Math.random() * 200;
        }
        
        // Reset tunnel
        for (const tunnel of this.tunnelSegments) {
            tunnel.position.z = -80;
        }
        
        console.log('Environment reset!');
    }
    
    /**
     * Get track segment at a specific position
     */
    getTrackSegmentAt(z) {
        for (const segment of this.trackSegments) {
            if (z >= segment.z && z < segment.z + segment.length) {
                return segment;
            }
        }
        return null;
    }
}

// Export the class
window.Environment = Environment;