const fs = require('fs');
const path = require('path');

// Get all HTML files in the root directory
const htmlFiles = fs.readdirSync('.')
  .filter(file => file.endsWith('.html'));

// Favicon code to insert
const faviconCode = `
    <!-- Favicon -->
    <link rel="icon" href="favicon.ico">
    <link rel="icon" href="favicon/favicon.svg" type="image/svg+xml">
    <link rel="apple-touch-icon" href="images/favicon/logo.png">
    <link rel="manifest" href="site.webmanifest">
`;

// Process each HTML file
htmlFiles.forEach(file => {
  console.log(`Processing ${file}...`);
  
  // Read the file content
  let content = fs.readFileSync(file, 'utf8');
  
  // Update the title
  content = content.replace(/<title>.*?<\/title>/g, '<title>En özel bağımsız etkinlik mekan ağı</title>');
  
  // Check if the file already has favicon code
  if (!content.includes('<!-- Favicon -->')) {
    // Find the position to insert the favicon code (before the first <style> or before </head>)
    const stylePos = content.indexOf('<style>');
    const headEndPos = content.indexOf('</head>');
    
    let insertPos;
    if (stylePos !== -1) {
      insertPos = stylePos;
    } else if (headEndPos !== -1) {
      insertPos = headEndPos;
    } else {
      console.log(`Could not find insertion point in ${file}`);
      return;
    }
    
    // Insert the favicon code
    const newContent = 
      content.slice(0, insertPos) + 
      faviconCode + 
      content.slice(insertPos);
    
    // Write the updated content back to the file
    fs.writeFileSync(file, newContent, 'utf8');
    console.log(`Added favicon to ${file}`);
  } else {
    // Replace existing favicon code
    content = content.replace(/<!-- Favicon -->[\s\S]*?(<style>|<\/head>)/m, 
      `<!-- Favicon -->
    <link rel="icon" href="favicon.ico">
    <link rel="icon" href="favicon/favicon.svg" type="image/svg+xml">
    <link rel="apple-touch-icon" href="images/favicon/logo.png">
    <link rel="manifest" href="site.webmanifest">
    $1`);
    
    // Write the updated content back to the file
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated favicon in ${file}`);
  }
});

console.log('Done updating favicon links and titles!'); 