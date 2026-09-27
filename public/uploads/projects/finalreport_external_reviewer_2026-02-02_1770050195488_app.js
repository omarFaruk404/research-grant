const { createServer } = require('http');
const next = require('next');

// Detect if we are in dev or production mode


// Initialize the Next.js app
const app = next({ dev:false });
const handle = app.getRequestHandler();

// Get the port from cPanel (process.env.PORT) or default to 3000
const port = process.env.PORT || 3000;

app.prepare().then(() => {
  createServer((req, res) => {
    // Let Next.js handle all requests
    handle(req, res);
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});