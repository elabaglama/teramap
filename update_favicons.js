const fs = require('fs');
const path = require('path');

// Version timestamp for cache busting
const version = Date.now();

// Favicon HTML template
const getFaviconHTML = (prefix = '') => `
    <!-- Favicon -->
    <link rel="icon" href="${prefix}favicon.ico?v=${version}">
    <link rel="icon" href="${prefix}favicon/favicon.svg?v=${version}" type="image/svg+xml">
    <link rel="apple-touch-icon" href="${prefix}favicon/favicon.png?v=${version}">
    <link rel="manifest" href="${prefix}site.webmanifest?v=${version}">
`;

// Function to update favicon links in HTML files
function updateFavicons(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const isSubDirectory = filePath.split(path.sep).length > 2;
    const prefix = isSubDirectory ? '../' : '';
    
    // Replace existing favicon section
    content = content.replace(
        /<!-- Favicon -->[\s\S]*?(?=<\/head>|<style>|<script>|<link[^>]*>(?!.*favicon))/i,
        getFaviconHTML(prefix)
    );
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated favicons in ${filePath}`);
}

// Find all HTML files recursively
function findHtmlFiles(dir) {
    let results = [];
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory() && !file.startsWith('.')) {
            results = results.concat(findHtmlFiles(filePath));
        } else if (file.endsWith('.html')) {
            results.push(filePath);
        }
    }
    
    return results;
}

// Update all HTML files
const htmlFiles = findHtmlFiles('.');
htmlFiles.forEach(updateFavicons);

console.log('Favicon update complete!'); 