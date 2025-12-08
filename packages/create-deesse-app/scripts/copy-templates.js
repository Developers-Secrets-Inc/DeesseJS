const fs = require('fs');
const path = require('path');

// Resolve paths
// scripts -> create-deesse-app -> packages -> root -> templates
const sourceDir = path.resolve(__dirname, '../../../template'); 
const destDir = path.resolve(__dirname, '../templates');

// Files/Folders to ignore during copy
const SKIP_FILES = ['node_modules', 'dist', '.git', '.DS_Store', 'bun.lockb', 'yarn.lock', 'package-lock.json'];

console.log(`🏗️  Preparing templates...\n   From: ${sourceDir}\n   To:   ${destDir}`);

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    if (SKIP_FILES.includes(entry.name)) continue;

    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

if (fs.existsSync(sourceDir)) {
    // Clean destination directory before copying
    if (fs.existsSync(destDir)) fs.rmSync(destDir, { recursive: true, force: true });
    
    copyDir(sourceDir, destDir);
    console.log('✅ Templates copied successfully.');
} else {
    console.error(`❌ ERROR: Could not find templates source at: ${sourceDir}`);
    process.exit(1);
}