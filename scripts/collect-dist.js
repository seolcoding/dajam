#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const appsDir = path.join(__dirname, '..', 'apps');
const publicDir = path.join(__dirname, '..', 'public');

// Clean and create public directory
if (fs.existsSync(publicDir)) {
  fs.rmSync(publicDir, { recursive: true });
}
fs.mkdirSync(publicDir, { recursive: true });

// Get all app directories
const apps = fs.readdirSync(appsDir).filter(name => {
  const appPath = path.join(appsDir, name);
  return fs.statSync(appPath).isDirectory();
});

// Copy each app's dist to public
apps.forEach(app => {
  const distPath = path.join(appsDir, app, 'dist');
  const targetPath = path.join(publicDir, app);

  if (fs.existsSync(distPath)) {
    copyRecursive(distPath, targetPath);
    console.log(`✓ Copied ${app}/dist -> public/${app}`);
  } else {
    console.log(`⚠ Skipped ${app} (no dist folder)`);
  }
});

// Create index.html with app list
const indexHtml = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SeolCoding Apps</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; background: #f5f5f5; padding: 2rem; }
    h1 { text-align: center; margin-bottom: 2rem; color: #333; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; max-width: 1200px; margin: 0 auto; }
    a { display: block; padding: 1.5rem; background: white; border-radius: 8px; text-decoration: none; color: #333; box-shadow: 0 2px 4px rgba(0,0,0,0.1); transition: transform 0.2s, box-shadow 0.2s; }
    a:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
    .name { font-weight: 600; font-size: 1.1rem; }
  </style>
</head>
<body>
  <h1>SeolCoding Mini Apps</h1>
  <div class="grid">
    ${apps.map(app => `<a href="/${app}/"><span class="name">${app}</span></a>`).join('\n    ')}
  </div>
</body>
</html>`;

fs.writeFileSync(path.join(publicDir, 'index.html'), indexHtml);
console.log('✓ Created public/index.html');

function copyRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log(`\n✅ Done! ${apps.length} apps collected to public/`);
