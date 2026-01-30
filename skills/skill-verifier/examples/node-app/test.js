/**
 * Simple tests for node-example skill
 */

const { add, multiply } = require('./index.js');

// Basic assertions
function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log('Running tests...');

// Test add
assert(add(2, 3) === 5, 'add(2, 3) should equal 5');
assert(add(-1, 1) === 0, 'add(-1, 1) should equal 0');
console.log('✓ add() tests passed');

// Test multiply
assert(multiply(2, 3) === 6, 'multiply(2, 3) should equal 6');
assert(multiply(0, 5) === 0, 'multiply(0, 5) should equal 0');
console.log('✓ multiply() tests passed');

console.log('\nAll tests passed! ✓');
