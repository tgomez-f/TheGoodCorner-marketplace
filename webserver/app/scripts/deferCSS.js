const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'build', 'index.html');

if (fs.existsSync(indexPath)) {
  let html = fs.readFileSync(indexPath, 'utf8');

  // Replaces standard <link rel="stylesheet" href="..."> with async media="print"
  html = html.replace(
    /<link\s+([^>]*?)rel="stylesheet"([^>]*?)>/gi,
    (match) => {
      // Keep noscript fallback for crawlers / JS disabled
      return `${match.replace('rel="stylesheet"', 'rel="preload" as="style"')} ` +
             `${match.replace('>', ' media="print" onload="this.media=\'all\'">')} ` +
             `<noscript>${match}</noscript>`;
    }
  );

  fs.writeFileSync(indexPath, html, 'utf8');
}