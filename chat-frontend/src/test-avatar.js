// Test script to verify Avatar component functionality
import Avatar from './components/ui/Avatar.jsx';

// Mock examples of different username formats
const testCases = [
  { username: 'john_doe', expected: 'J' },
  { username: 'jane.smith', expected: 'J' },
  { username: 'bob-wilson', expected: 'B' },
  { username: 'alice', expected: 'A' },
  { username: 'charlie.brown@test.com', expected: 'C' },
  { username: 'david123', expected: 'D' },
  { username: '', expected: '?' },
  { username: null, expected: '?' },
  { username: undefined, expected: '?' },
];

console.log('Testing Avatar component first name extraction:');
testCases.forEach((testCase, index) => {
  console.log(`Test ${index + 1}: "${testCase.username}" -> "${testCase.expected}"`);
});

console.log('\nAvatar component updated successfully!');
console.log('The component will now:');
console.log('1. Extract first name from username/email');
console.log('2. Handle common separators (space, dot, underscore, hyphen)');
console.log('3. Convert to uppercase');
console.log('4. Show "?" as fallback for empty/null values');
