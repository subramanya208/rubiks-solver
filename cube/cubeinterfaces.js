// Initialize cube
window.onload = function() {
  if (typeof jQuery === 'undefined') {
    console.error('jQuery is not loaded!');
    return;
  }
  
  if (typeof ERNO === 'undefined') {
    console.error('ERNO is not defined! Make sure cuber.min.js is loaded correctly.');
    return;
  }
  
  if (typeof THREE === 'undefined') {
    console.error('THREE is not defined! Make sure three.min.js is loaded correctly.');
    return;
  }
  
  const container = document.getElementById('container');
  if (!container) {
    console.error('Container element not found!');
    return;
  }
  
  // Create cube
  var controls = ERNO.Locked; 
  window.cubeGL = new ERNO.Cube({ 
    hideInvisibleFaces: true, 
    controls: controls 
  }); 
  
  container.appendChild(cubeGL.domElement);

  // Fix the cube's orientation
  if (controls === ERNO.Locked) { 
    const fixedOrientation = new THREE.Euler(Math.PI * 0.1, Math.PI * -0.25, 0); 
    cubeGL.object3D.lookAt(cubeGL.camera.position); 
    cubeGL.rotation.x += fixedOrientation.x; 
    cubeGL.rotation.y += fixedOrientation.y; 
    cubeGL.rotation.z += fixedOrientation.z; 
  } 

  // Set animation speed for twists
  cubeGL.twistDuration = 300;
  
  // Helper function to check if cube is ready for next twist
  cubeGL.isReady = function() {
    return this.isTweening() === 0;
  };
  
  // Store reference to original twist function
  const originalTwist = cubeGL.twist;
  cubeGL.twist.__originalFunction = originalTwist;
  
  cubeGL.twist = function(command) {
    return originalTwist.call(this, command);
  };

  // Animate cube on load
  cubeGL.twist('xY');

  // Initialize light
  var light = new Photon.Light(10, 0, 100);
  
  // Add event listener for Enter key on move input
  const moveInput = document.getElementById('move-input');
  if (moveInput) {
    moveInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        executeManualMoves();
      }
    });
  }
};

// Terminal feedback function
function typeInfo(sentence, if_del) {
  const terminal = document.getElementById('terminal');
  if (!terminal) return;
  
  terminal.innerHTML = '';
  try {
    const typewriter = new Typewriter(terminal, { loop: false, delay: 25 });
    if (if_del) {
      typewriter.typeString(sentence).pauseFor(500).deleteAll().start();
    } else {
      typewriter.typeString(sentence).start();
    }
  } catch (e) {
    terminal.textContent = sentence;
  }
} 

// Shuffle function
function cubeShuffle() {
  if (cubeGL.isTweening() > 0) {
    if (typeof TWEEN !== 'undefined') {
      TWEEN.update(cubeGL.time + 1000);
    }
    setTimeout(cubeShuffle, 200);
    return;
  }
  
  resetTimer();
  
  const originalDuration = cubeGL.twistDuration;
  cubeGL.twistDuration = 450;
  
  const numMoves = 12;
  const possibleMoves = ['F', 'B', 'U', 'D', 'L', 'R', 'f', 'b', 'u', 'd', 'l', 'r'];
  let shuffleMoves = [];
  
  for (let i = 0; i < numMoves; i++) {
    const randomIndex = Math.floor(Math.random() * possibleMoves.length);
    shuffleMoves.push(possibleMoves[randomIndex]);
  }
  
  const shuffleSequence = shuffleMoves.join(' ');
  
  cubeGL.twist(shuffleSequence);
  typeInfo("Shuffled: " + shuffleMoves.join(' '), true);
  window.lastShuffle = shuffleSequence;
  
  setTimeout(function() {
    cubeGL.twistDuration = originalDuration;
  }, shuffleMoves.length * cubeGL.twistDuration + 500);
} 

// Solve button handler
function cubeSolveLBL() {
  startTimer();
  typeInfo("Solving with LBL algorithm...", true);
  
  if (cubeGL.isTweening() > 0) {
    if (typeof TWEEN !== 'undefined') {
      TWEEN.update(cubeGL.time + 1000);
    }
    setTimeout(cubeSolveLBL, 200);
    return;
  }
  
  const originalDuration = cubeGL.twistDuration;
  cubeGL.twistDuration = 450;
  
  if (window.solver && typeof window.solver.logic === 'function') {
    try {
      window.solver.logic(cubeGL);
    } catch (error) {
      typeInfo("Error in LBL solver: " + error.message, false);
      setTimeout(function() {
        cubeGL.twistDuration = originalDuration;
      }, 100);
    }
  } else {
    typeInfo("LBL solver not available", false);
    setTimeout(function() {
      cubeGL.twistDuration = originalDuration;
    }, 100);
  }
}

// Reset button handler
function cubeReset() {
  typeInfo("Resetting cube to solved state...", true);
  resetTimer();
  window.lastShuffle = null;
  
  if (cubeGL.isTweening() > 0) {
    if (typeof TWEEN !== 'undefined') {
      TWEEN.update(cubeGL.time + 1000);
    }
  }
  
  const originalDuration = cubeGL.twistDuration;
  cubeGL.twistDuration = 0;
  
  try {
    const newCube = new ERNO.Cube({
      hideInvisibleFaces: true,
      controls: ERNO.Locked
    });
    
    for (let i = 0; i < 6; i++) {
      const face = ['front', 'up', 'right', 'down', 'left', 'back'][i];
      for (let j = 0; j < 9; j++) {
        const cubelet = cubeGL[face].cubelets[j];
        const newCubelet = newCube[face].cubelets[j];
        
        cubelet.address = newCubelet.address;
        cubelet.position.copy(newCubelet.position);
        cubelet.matrix.copy(newCubelet.matrix);
        cubelet.rotation.set(0, 0, 0);
        
        for (let f = 0; f < 6; f++) {
          if (cubelet.faces[f] && newCubelet.faces[f]) {
            cubelet.faces[f].color = newCubelet.faces[f].color;
            
            if (cubelet.faces[f].element) {
              const sticker = cubelet.faces[f].element.querySelector('.sticker');
              if (sticker) {
                sticker.classList.remove('red', 'white', 'blue', 'green', 'orange', 'yellow');
                sticker.classList.add(newCubelet.faces[f].color.name);
              }
            }
          }
        }
      }
    }
    
    cubeGL.isReady = function() { return true; };
    newCube.domElement.remove();
    
    const fixedOrientation = new THREE.Euler(Math.PI * 0.1, Math.PI * -0.25, 0);
    cubeGL.object3D.lookAt(cubeGL.camera.position);
    cubeGL.rotation.x = fixedOrientation.x;
    cubeGL.rotation.y = fixedOrientation.y;
    cubeGL.rotation.z = fixedOrientation.z;
    
    setTimeout(function() {
      cubeGL.twistDuration = originalDuration;
      typeInfo("Cube reset complete!", true);
    }, 100);
    
  } catch (error) {
    try {
      const colors = ['front', 'up', 'right', 'down', 'left', 'back'];
      const colorMap = {
        'front': 'green',
        'up': 'white',
        'right': 'red',
        'down': 'yellow',
        'left': 'orange',
        'back': 'blue'
      };
      
      for (let i = 0; i < colors.length; i++) {
        const face = colors[i];
        const color = colorMap[face];
        
        for (let j = 0; j < 9; j++) {
          const cubelet = cubeGL[face].cubelets[j];
          
          for (let f = 0; f < 6; f++) {
            if (cubelet.faces[f] && 
                cubelet.faces[f].normal.equals(cubeGL[face].normal)) {
              
              cubelet.faces[f].color.name = color;
              
              if (cubelet.faces[f].element) {
                const sticker = cubelet.faces[f].element.querySelector('.sticker');
                if (sticker) {
                  sticker.classList.remove('red', 'white', 'blue', 'green', 'orange', 'yellow');
                  sticker.classList.add(color);
                }
              }
            }
          }
        }
      }
      
      setTimeout(function() {
        cubeGL.twistDuration = originalDuration;
        typeInfo("Cube reset complete!", true);
      }, 100);
      
    } catch (fallbackError) {
      typeInfo("Reset failed: " + error.message, false);
      setTimeout(function() {
        cubeGL.twistDuration = originalDuration;
      }, 100);
    }
  }
}

// Manual Move Input Functions

// Function to show error message
function showMoveError(message) {
  const errorDiv = document.getElementById('move-error');
  const inputField = document.getElementById('move-input');
  
  if (errorDiv && inputField) {
    errorDiv.textContent = message;
    errorDiv.classList.add('show');
    inputField.classList.add('error');
    
    setTimeout(() => {
      errorDiv.classList.remove('show');
      inputField.classList.remove('error');
    }, 3000);
  }
}

function clearMoveError() {
  const errorDiv = document.getElementById('move-error');
  const inputField = document.getElementById('move-input');
  
  if (errorDiv && inputField) {
    errorDiv.classList.remove('show');
    inputField.classList.remove('error');
  }
}

// Move validation function
function validateAndConvertMoves(sequence) {
  const validMoves = {
    'R': 'R', 'R\'': 'r', 'R2': 'R R',
    'L': 'L', 'L\'': 'l', 'L2': 'L L',
    'U': 'U', 'U\'': 'u', 'U2': 'U U',
    'D': 'D', 'D\'': 'd', 'D2': 'D D',
    'F': 'F', 'F\'': 'f', 'F2': 'F F',
    'B': 'B', 'B\'': 'b', 'B2': 'B B'
  };
  
  const inputMoves = sequence.trim().split(/\s+/);
  const convertedMoves = [];
  
  for (let i = 0; i < inputMoves.length; i++) {
    const move = inputMoves[i];
    if (validMoves[move]) {
      const converted = validMoves[move];
      if (converted.includes(' ')) {
        convertedMoves.push(...converted.split(' '));
      } else {
        convertedMoves.push(converted);
      }
    } else {
      return {
        error: `Invalid move: "${move}". Valid moves: R, R', R2, L, L', L2, U, U', U2, D, D', D2, F, F', F2, B, B', B2`
      };
    }
  }
  
  return {
    moves: convertedMoves,
    error: null
  };
}

// Manual moves function
function executeManualMoves() {
  const inputField = document.getElementById('move-input');
  const playButton = document.getElementById('play-button');
  
  if (!inputField) return;
  
  const sequence = inputField.value.trim();
  
  if (sequence === '') {
    cubeShuffle();
    return;
  }
  
  const validatedMoves = validateAndConvertMoves(sequence);
  if (validatedMoves.error) {
    showMoveError(validatedMoves.error);
    return;
  }
  
  clearMoveError();
  
  if (cubeGL.isTweening() > 0) {
    if (typeof TWEEN !== 'undefined') {
      TWEEN.update(cubeGL.time + 1000);
    }
    setTimeout(executeManualMoves, 200);
    return;
  }
  
  if (playButton) {
    playButton.disabled = true;
  }
  
  const originalDuration = cubeGL.twistDuration;
  cubeGL.twistDuration = 450;
  
  let shuffleMoves = validatedMoves.moves;
  const shuffleSequence = shuffleMoves.join(' ');
  
  cubeGL.twist(shuffleSequence);
  typeInfo("Manual moves: " + shuffleMoves.join(' '), true);
  window.lastShuffle = shuffleSequence;
  
  setTimeout(function() {
    cubeGL.twistDuration = originalDuration;
    inputField.value = '';
    if (playButton) {
      playButton.disabled = false;
    }
  }, shuffleMoves.length * cubeGL.twistDuration + 500);
}

// Make functions available globally
window.executeManualMoves = executeManualMoves;

// Timer functionality
let timerState = {
  startTime: null,
  isRunning: false,
  intervalId: null
};

function startTimer() {
  if (!timerState.isRunning) {
    timerState.startTime = Date.now();
    timerState.isRunning = true;
    timerState.intervalId = setInterval(updateTimer, 10);
  }
}

function stopTimer() {
  if (timerState.isRunning) {
    clearInterval(timerState.intervalId);
    timerState.isRunning = false;
    return getElapsedTime();
  }
  return null;
}

function resetTimer() {
  stopTimer();
  timerState.startTime = null;
  updateTimerDisplay('00:00.00');
}

function getElapsedTime() {
  if (timerState.startTime) {
    return Date.now() - timerState.startTime;
  }
  return 0;
}

function updateTimer() {
  if (timerState.isRunning && timerState.startTime) {
    const elapsed = getElapsedTime();
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    const milliseconds = Math.floor((elapsed % 1000) / 10);
    
    const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
    updateTimerDisplay(timeString);
  }
}

function updateTimerDisplay(timeString) {
  const timerElement = document.getElementById('timer');
  if (timerElement) {
    timerElement.textContent = timeString;
  }
}



// Cube solved validation
function checkIfCubeSolved() {
  if (!window.cubeGL) return false;
  
  try {
    const faces = ['front', 'up', 'right', 'down', 'left', 'back'];
    for (const face of faces) {
      const centerColor = cubeGL[face].cubelets[4][face].color.name;
      for (let i = 0; i < 9; i++) {
        if (i === 4) continue;
        if (cubeGL[face].cubelets[i][face].color.name !== centerColor) {
          return false;
        }
      }
    }
    return true;
  } catch (error) {
    return false;
  }
}

function showSolvedIndicator() {
  const overlay = document.getElementById('solved-overlay');
  if (overlay) {
    overlay.style.display = 'flex';
    
    const elapsedTime = stopTimer();
    if (elapsedTime) {
      const minutes = Math.floor(elapsedTime / 60000);
      const seconds = Math.floor((elapsedTime % 60000) / 1000);
      const milliseconds = Math.floor((elapsedTime % 1000) / 10);
      const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
      
      const message = document.querySelector('#solved-message p');
      if (message) {
        message.textContent = `Congratulations! The cube has been solved in ${timeString}!`;
      }
    }
  }
}

function hideSolvedIndicator() {
  const overlay = document.getElementById('solved-overlay');
  if (overlay) {
    overlay.style.display = 'none';
  }
}

// Make UI functions available globally
window.startTimer = startTimer;
window.stopTimer = stopTimer;
window.resetTimer = resetTimer;
window.showSolvedIndicator = showSolvedIndicator;
window.hideSolvedIndicator = hideSolvedIndicator;