# 3D Rubik's Cube Solver

A web-based 3D Rubik's Cube solver with a  Layer-by-Layer (LBL) algorithm that can solve any scrambled 3x3 cube state.

## 🎯 Features

- **Custom LBL Algorithm**: A Cube solver using Layer by Layer approach.
- **3D Interactive Visualization**: Smooth cube rotations and animations are from [Cuber](https://github.com/marklundin/cube).
- **Manual Move Input**: Standard notation support (R, U, R', R2, etc.)
- **One-Click Shuffle**: Random 12-move scrambles.
- **Real-time Timer**: Precision timing with millisecond accuracy
- **Solved State Detection**: Automatic celebration when completed

## 🚀 Quick Start

## method 1: Direct Browser
```
1. Open cube/index.html in your web browser
2. Click "Shuffle" to scramble the cube
3. Click "Solve LBL" to watch the algorithm solve it
```

### Method 2: Local Server 
```bash
# Using Python
python -m http.server 8000
# Navigate to http://localhost:8000/cube/

# Using Node.js
npx http-server
# Navigate to provided local URL
```

## 🎮 How to Use

1. **Shuffle**: Click "Shuffle" to randomize the cube
2. **Manual Moves**: Enter moves like "R U R' U'" in the bottom input field
3. **Auto Solve**: Click "Solve LBL" to execute the solving algorithm
4. **Reset**: Click "Reset" to return to solved state
5. **Timer**: Automatically tracks solving time

## 🧠 Algorithm Details

- **Strategy**: Layer-by-Layer (LBL) method
- **Steps**: 7 sequential solving phases
                    The First Layer Edges
                    The First Layer Corners
                    The Second Layer
                    The Top Cross
                    The Third Layer Corners (Position)
                    The Third Layer Corners (Orient)
                    The Third Layer Edges
- **Average Moves**: 60-85 moves per solve
- **Time Complexity**: O(n) linear performance
- **Optimization**: Move compression and redundancy elimination

## 📁 Project Structure

```
Subramanyarohans/
├── solver/
│   └── lbl_sol.js              #  LBL algorithm 
├── cube/
│   ├── index.html              # Main application
│   ├── cubeinterfaces.js       # UI controls and interactions
│   ├── styles/                 # CSS styling
│   ├── js/                     # 3D visualization libraries
│   └── media/                  # Assets and fonts
└── README.md                       # This file
```

## 🛠️ Tech Stack

- **Algorithm**: JavaScript (ES6+)
- **3D Rendering**: Three.js + ERNO Cube Library
- **UI**: HTML5, CSS3, Tailwind CSS
- **Interactions**: jQuery, Typewriter.js
- **No Installation Required**: Runs entirely in browser


## 🎯 Performance

- **Average Solution**: 60-85 moves
- **Execution Time**: ~30-45 seconds (with animations)
- **Success Rate**: 100% (guaranteed to solve any valid state)
- **Browser Support**: Chrome, Firefox, Safari, Edge

---