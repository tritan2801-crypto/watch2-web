const { spawn } = require('child_process');
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
      console.log(`[Schema Copier] Copied: ${src} -> ${dest}`);
    }
  }
}

const srcDir = path.join(__dirname, 'src');
const destDir = path.join(__dirname, 'dist', 'src');

function runCopy() {
  if (fs.existsSync(srcDir)) {
    console.log('[Schema Copier] Copying schema.json files to dist...');
    copyRecursiveSync(srcDir, destDir);
    console.log('[Schema Copier] Done copying schemas!');
  } else {
    console.log('[Schema Copier] src directory not found!');
  }
}

// Start strapi develop process
console.log('[Runner] Starting strapi develop...');
const strapi = spawn('strapi', ['develop'], {
  stdio: ['inherit', 'pipe', 'inherit'],
  shell: true,
  env: { ...process.env, FORCE_COLOR: true }
});

let cleaned = false;

// Monitor stdout to detect the Clean step in Strapi v5 develop
strapi.stdout.on('data', (data) => {
  const output = data.toString();
  process.stdout.write(data);

  if (output.includes('Cleaning dist') || output.includes('Cleaning dist dir')) {
    cleaned = true;
    // Introduce a brief delay for cleaning to finish before copying
    setTimeout(() => {
      console.log('[Runner] Cleaning completed. Executing schema copy...');
      runCopy();
    }, 400);
  }
});

// Run a fallback copying routine after 3.5 seconds in case stdout is piped differently
setTimeout(() => {
  if (!cleaned) {
    console.log('[Runner] Running fallback schema copy...');
    runCopy();
  }
}, 3500);

// File watcher to copy any new or modified JSON schemas on-the-fly
fs.watch(srcDir, { recursive: true }, (eventType, filename) => {
  if (filename && filename.endsWith('.json')) {
    console.log(`[Runner] Change detected in JSON schema: ${filename}. Copying...`);
    const srcFile = path.join(srcDir, filename);
    const destFile = path.join(destDir, filename);
    if (fs.existsSync(srcFile)) {
      const destDirName = path.dirname(destFile);
      if (!fs.existsSync(destDirName)) {
        fs.mkdirSync(destDirName, { recursive: true });
      }
      fs.copyFileSync(srcFile, destFile);
    }
  }
});

strapi.on('close', (code) => {
  console.log(`[Runner] Strapi process exited with code ${code}`);
  process.exit(code || 0);
});
