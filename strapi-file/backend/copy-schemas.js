const fs = require('fs');
const path = require('path');

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    // Only copy .json files (schemas)
    if (src.endsWith('.json')) {
      const destDir = path.dirname(dest);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      fs.copyFileSync(src, dest);
      console.log(`Copied: ${src} -> ${dest}`);
    }
  }
}

const srcDir = path.join(__dirname, 'src');
const destDir = path.join(__dirname, 'dist', 'src');

if (fs.existsSync(srcDir)) {
  console.log('Copying schema.json files to dist...');
  copyRecursiveSync(srcDir, destDir);
  console.log('Done copying schemas!');
} else {
  console.log('src directory not found!');
}
