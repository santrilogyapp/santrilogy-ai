// download-dependencies.js
// Script untuk mengunduh library eksternal ke folder assets

const fs = require('fs');
const path = require('path');
const https = require('https');

// Definisi library yang perlu diunduh
const libraries = [
  {
    url: 'https://cdn.jsdelivr.net/npm/marked/marked.min.js',
    path: './assets/js/marked/marked.min.js'
  },
  {
    url: 'https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js',
    path: './assets/js/mermaid/mermaid.min.js'
  },
  {
    url: 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js',
    path: './assets/js/highlight.js/highlight.min.js'
  },
  {
    url: 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/index.js',
    path: './assets/js/supabase/supabase-js@2.js'
  },
  {
    url: 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css',
    path: './assets/css/highlight.js/11.9.0/github-dark.min.css'
  }
];

function downloadFile(url, destination) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destination);
    
    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Handle redirect
        downloadFile(response.headers.location, destination)
          .then(resolve)
          .catch(reject);
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`✓ Downloaded: ${destination}`);
        resolve();
      });
      
      file.on('error', (err) => {
        fs.unlink(destination, () => {}); // Delete the file async
        console.error(`✗ Error downloading: ${destination}`, err.message);
        reject(err);
      });
    }).on('error', (err) => {
      console.error(`✗ HTTP Error: ${url}`, err.message);
      reject(err);
    });
  });
}

async function downloadAllLibraries() {
  console.log('Starting download of external libraries...');
  
  // Buat direktori jika belum ada
  const directories = [
    './assets/js/marked',
    './assets/js/mermaid',
    './assets/js/highlight.js',
    './assets/js/supabase',
    './assets/css/highlight.js/11.9.0'
  ];
  
  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✓ Created directory: ${dir}`);
    }
  });
  
  // Unduh semua library
  for (const lib of libraries) {
    try {
      await downloadFile(lib.url, lib.path);
    } catch (error) {
      console.error(`Failed to download ${lib.url}:`, error.message);
    }
  }
  
  console.log('Download process completed!');
}

// Jalankan fungsi jika file ini dijalankan langsung
if (require.main === module) {
  downloadAllLibraries().catch(console.error);
}

module.exports = { downloadAllLibraries, downloadFile };