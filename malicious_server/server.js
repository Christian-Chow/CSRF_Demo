const express = require('express');
const path = require('path');
const app = express();
const port = 3001; // Using port 3001 to avoid conflict with the main server

// Serve static files from the current directory
app.use(express.static(__dirname));

// Serve the main page
app.get('/', (req, res) => {
    res.send("hello world");
    // res.send('<a href="fakeprize.html">Demo</a>');
});

// Start the server
app.listen(port, () => {
    console.log(`Malicious server running at http://localhost:${port}`);
}); 