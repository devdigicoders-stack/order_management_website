const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const classMapping = {
  'text-6xl': 'text-5xl',
  'text-5xl': 'text-4xl',
  'text-4xl': 'text-3xl',
  'text-3xl': 'text-2xl',
  'text-2xl': 'text-xl',
  'text-xl': 'text-lg',
  'text-lg': 'text-base',
  'text-base': 'text-sm'
};

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (stat.isFile() && (fullPath.endsWith('.jsx') || fullPath.endsWith('.js') || fullPath.endsWith('.tsx') || fullPath.endsWith('.ts'))) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      
      // We want to match text-classes with boundaries so we don't accidentally match something like `my-text-lg`
      // A typical tailwind class is either preceded by a space, quote, or colon (for responsive variants like md:text-lg)
      // We will iterate over keys in order of length descending just in case, though they don't overlap in a way that matters if we use word boundaries.
      
      const keys = Object.keys(classMapping).sort((a, b) => b.length - a.length);
      
      for (const key of keys) {
        // Regex to match the exact class (including responsive prefix support if needed, but here we just match the class itself)
        // Lookbehind for space, quote, backtick, or colon
        // Lookahead for space, quote, or backtick
        // Note: Javascript regex doesn't support arbitrary length lookbehinds, but we can match the prefix character.
        
        const regex = new RegExp(`(^|['"\\\`\\\\s:])(${key})(?=['"\\\`\\\\s]|$)`, 'g');
        const originalContent = content;
        content = content.replace(regex, `$1${classMapping[key]}`);
        
        if (content !== originalContent) {
          modified = true;
        }
      }
      
      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

processDirectory(srcDir);
console.log('Text size reduction complete.');
