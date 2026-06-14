/**
 * Generates pseudo-random 7-character commit hashes
 * that look like real Git short hashes.
 */

const HEX_CHARS = '0123456789abcdef';
let hashCounter = 0;

export function generateHash() {
  hashCounter++;
  const seed = Date.now() + hashCounter + Math.random() * 1000000;
  let hash = '';
  let current = seed;
  
  for (let i = 0; i < 7; i++) {
    current = (current * 16807 + 12345) % 2147483647;
    hash += HEX_CHARS[Math.abs(current) % 16];
  }
  
  return hash;
}

export function shortHash(hash) {
  return hash ? hash.substring(0, 7) : '';
}

export function resetHashCounter() {
  hashCounter = 0;
}
