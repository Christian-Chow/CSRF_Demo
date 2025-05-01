const express = require('express');
const path = require('path');
const app = express();
const port = 3032;

// Serve static files from the current directory
app.use(express.static(__dirname));

// Serve the blog page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'blog.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`Blog server running at http://localhost:${port}`);
}); 