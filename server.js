const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { solve } = require('./solver');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '100kb' }));

const requestCounts = {};
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 30;

app.use((req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  
  requestCounts[ip] = requestCounts[ip] || [];
  requestCounts[ip] = requestCounts[ip].filter(time => time > now - RATE_LIMIT_WINDOW_MS);
  
  if (requestCounts[ip].length >= RATE_LIMIT_MAX) {
    return res.status(429).json({ 
      error: 'Too many requests', 
      message: 'Please try again later' 
    });
  }
  
  requestCounts[ip].push(now);
  next();
});

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.status(200).json({
    name: 'Rubik\'s Cube Solver API',
    version: '1.0.0',
    endpoints: [
      { method: 'GET', path: '/health', description: 'Health check endpoint' },
      { method: 'POST', path: '/solve', description: 'Solve a Rubik\'s cube' }
    ],
    example: {
      request: {
        method: 'POST',
        path: '/solve',
        body: {
          cubeState: {
            up: ['W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W'],
            down: ['Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y'],
            left: ['O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O'],
            right: ['R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R'],
            front: ['G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G'],
            back: ['B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B']
          }
        }
      }
    }
  });
});

app.post('/solve', (req, res) => {
  try {
    const { cubeState } = req.body;
    
    if (!cubeState) {
      return res.status(400).json({ 
        error: 'Missing cubeState in request body' 
      });
    }
    
    if (!isValidCubeState(cubeState)) {
      return res.status(400).json({ 
        error: 'Invalid cubeState format',
        message: 'The cube state must include all six faces (up, down, left, right, front, back) with 9 elements each'
      });
    }
    
    const startTime = Date.now();
    const solution = solve(cubeState);
    const solveTime = Date.now() - startTime;
    
    return res.status(200).json({ 
      solution,
      moves: solution.split(' ').length,
      solveTimeMs: solveTime
    });
  } catch (error) {
    console.error('Error solving cube:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: `The requested resource '${req.path}' was not found on this server`
  });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message
  });
});

function isValidCubeState(cubeState) {
  if (typeof cubeState !== 'object' || cubeState === null) {
    return false;
  }
  
  const requiredFaces = ['up', 'down', 'left', 'right', 'front', 'back'];
  
  for (const face of requiredFaces) {
    if (!cubeState[face] || !Array.isArray(cubeState[face])) {
      return false;
    }
    
    if (cubeState[face].length !== 9) {
      return false;
    }
    
    if (!cubeState[face].every(color => typeof color === 'string')) {
      return false;
    }
  }
  
  return true;
}

if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(PORT, () => {
    console.log(`Rubik's Cube solver server running on port ${PORT}`);
  });
  
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      console.log('HTTP server closed');
    });
  });
}

module.exports = app;