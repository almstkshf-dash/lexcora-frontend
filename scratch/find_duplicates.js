const fs = require('fs');
const content = fs.readFileSync('messages/ar.json', 'utf8');
const lines = content.split('\n');
const keys = {};

lines.forEach((line, index) => {
  const match = line.match(/^\s*"([^"]+)"\s*:/);
  if (match) {
    const key = match[1];
    if (keys[key]) {
      keys[key].push(index + 1);
    } else {
      keys[key] = [index + 1];
    }
  }
});

for (const key in keys) {
  if (keys[key].length > 1) {
    console.log(`${key}: ${keys[key].join(', ')}`);
  }
}
