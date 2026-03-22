# Subway Runner 3D - Endless Runner Game

A 3D endless runner game inspired by Subway Surfers, built with HTML, CSS, JavaScript, and Three.js.

## Features

- **3D Graphics**: Rendered with Three.js for immersive gameplay
- **Player Controls**: 
  - Arrow Left/Right: Switch between 3 lanes
  - Arrow Up: Jump over obstacles
  - Arrow Down: Slide under obstacles
- **Automatic Running**: Player runs forward automatically
- **Obstacle System**: Randomly generated trains, barriers, and signals
- **Coin Collection**: Collect coins for bonus points
- **Progressive Difficulty**: Game speed increases over time
- **Collision Detection**: Game over when hitting obstacles
- **Score System**: Points for distance and coins collected
- **UI Screens**: Start screen, in-game HUD, and game over screen

## Project Structure

```
Diamond Exchange/
├── index.html          # Main HTML file
├── style.css           # CSS styles
├── README.md           # This file
├── js/
│   ├── main.js         # Game entry point and state management
│   ├── gameManager.js  # Three.js engine and game loop
│   ├── player.js       # Player character and controls
│   ├── environment.js  # 3D environment and track
│   ├── obstacleManager.js # Obstacle and coin generation
│   ├── uiManager.js    # UI updates and feedback
│   └── physics.js      # Collision detection
└── assets/             # (Optional) For future textures/models
```

## How to Run in VS Code with Live Server

### Prerequisites
1. Install [Visual Studio Code](https://code.visualstudio.com/)
2. Install the "Live Server" extension in VS Code

### Steps to Run
1. Open the project folder in VS Code
2. Right-click on `index.html` in the file explorer
3. Select "Open with Live Server"
4. The game will open in your default web browser
5. Click "START GAME" to begin playing

### Alternative: Direct Browser Opening
1. Simply open `index.html` in any modern web browser
2. Make sure you have an internet connection (for loading Three.js libraries)

## Controls

- **Arrow Left**: Move to left lane
- **Arrow Right**: Move to right lane  
- **Arrow Up**: Jump
- **Arrow Down**: Slide
- **Space**: Alternative jump key
- **Escape**: Pause/Resume game

## Game Mechanics

1. **Automatic Movement**: Your character runs forward automatically
2. **Three Lanes**: Left, center, and right lanes for navigation
3. **Obstacle Avoidance**: 
   - Jump over barriers and crates
   - Slide under trains and signals
4. **Coin Collection**: Collect gold coins for bonus points
5. **Scoring**:
   - Base points for distance traveled
   - Bonus points for coins collected
   - Speed multiplier increases score rate
6. **Progressive Difficulty**: Game speed increases gradually

## Technical Details

- Built with Three.js r128 for 3D rendering
- Uses requestAnimationFrame for smooth 60fps gameplay
- Modular JavaScript architecture for maintainability
- Object pooling for efficient obstacle/coin management
- Bounding box collision detection
- Local storage for high score persistence

## Browser Compatibility

- Chrome 60+ (recommended)
- Firefox 55+
- Safari 11+
- Edge 79+

## Development Notes

- All code is thoroughly commented for educational purposes
- The game uses CDN-hosted libraries (Three.js, Tween.js, Font Awesome)
- No external assets required - all 3D models are procedurally generated
- Responsive design works on most screen sizes

## Future Enhancements

Potential improvements that could be added:
1. Sound effects and background music
2. More obstacle types and power-ups
3. Character customization
4. Mobile touch controls
5. Particle effects for collisions
6. Day/night cycle
7. Multiple levels or environments

## Troubleshooting

If the game doesn't run properly:

1. **Check console errors**: Press F12 and look for errors in the Console tab
2. **Ensure internet connection**: The game loads Three.js from CDN
3. **Clear browser cache**: Sometimes old cached files cause issues
4. **Try a different browser**: Some browsers have better WebGL support

## Credits

Created as a demonstration of 3D web game development using Three.js.

Game concept inspired by Subway Surfers by Kiloo and SYBO Games.

## License

This project is for educational purposes. Feel free to modify and learn from the code.