/**
 * Test script for the Rubik's Cube Solver API
 * Run with: node test.js
 */

const http = require('http');

const solvedCube = {
  up: ['W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W'],
  down: ['Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y'],
  left: ['O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O'],
  right: ['R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R'],
  front: ['G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G'],
  back: ['B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B']
};

const scrambledCube = {
  up: ['W', 'R', 'W', 'G', 'W', 'G', 'W', 'R', 'W'],
  down: ['Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y'],
  left: ['O', 'O', 'B', 'O', 'O', 'B', 'O', 'O', 'B'],
  right: ['R', 'R', 'G', 'R', 'R', 'G', 'R', 'R', 'G'],
  front: ['G', 'O', 'G', 'O', 'G', 'O', 'G', 'O', 'G'],
  back: ['B', 'B', 'R', 'B', 'B', 'R', 'B', 'B', 'R']
};

const invalidCube = {
  up: ['W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W'],
  down: ['Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y'],
  left: ['O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O'],
  right: ['R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R'],
  front: ['G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G']
};

function testSolveEndpoint(cubeState, testName) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/solve',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log(`\n${testName} - Status: ${res.statusCode}`);
          console.log(JSON.stringify(response, null, 2));
          resolve({ statusCode: res.statusCode, response });
        } catch (error) {
          console.error(`Error parsing response: ${error.message}`);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error(`Request error: ${error.message}`);
      reject(error);
    });

    req.write(JSON.stringify({ cubeState }));
    req.end();
  });
}

function testHealthEndpoint() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/health',
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log(`\nHealth Check - Status: ${res.statusCode}`);
          console.log(JSON.stringify(response, null, 2));
          resolve({ statusCode: res.statusCode, response });
        } catch (error) {
          console.error(`Error parsing response: ${error.message}`);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error(`Request error: ${error.message}`);
      reject(error);
    });

    req.end();
  });
}

async function runTests() {
  console.log('Starting Rubik\'s Cube Solver API tests...');
  
  try {
    await testHealthEndpoint();
    await testSolveEndpoint(solvedCube, 'Test Solved Cube');
    await testSolveEndpoint(scrambledCube, 'Test Scrambled Cube');
    await testSolveEndpoint(invalidCube, 'Test Invalid Cube');
    
    console.log('\nAll tests completed!');
  } catch (error) {
    console.error(`Test suite error: ${error.message}`);
    console.error('Make sure the server is running on port 3000');
  }
}

runTests();