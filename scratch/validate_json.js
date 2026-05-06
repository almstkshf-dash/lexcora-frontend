const fs = require('fs');
const path = 'c:/Users/ceo/OneDrive/Desktop/ليكسورا/lexcora/lexcora-frontend/src/messages/en.json';

try {
    const content = fs.readFileSync(path, 'utf8');
    JSON.parse(content);
    console.log('JSON is valid');
} catch (e) {
    console.error('JSON is invalid:', e.message);
    // Find the line number
    const pos = e.message.match(/at position (\d+)/);
    if (pos) {
        const index = parseInt(pos[1]);
        const lines = content.slice(0, index).split('\n');
        console.error('Error at line:', lines.length);
        console.error('Near text:', content.slice(index - 20, index + 20));
    }
}
