const express = require('express');
const path = require('path');
const app = express();
const port = 3032;

// In-memory storage for comments
const comments = [];

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the current directory
app.use(express.static(__dirname));

// Serve the blog page
app.get('/', (req, res) => {
    // Remove any security headers
    res.setHeader('X-XSS-Protection', '0');
    res.setHeader('Content-Security-Policy', '');
    res.sendFile(path.join(__dirname, 'blog.html'));
});

// Get all comments
app.get('/api/comments', (req, res) => {
    // Remove any security headers
    res.setHeader('X-XSS-Protection', '0');
    res.setHeader('Content-Security-Policy', '');
    res.json(comments);
});

// Handle comment submissions - No sanitization!
app.post('/api/comments', (req, res) => {
    const { postId, author, text } = req.body;
    console.log('New comment received:', { postId, author, text });
    
    // Store the comment in memory
    const comment = {
        id: comments.length,
        postId,
        author,
        text: text, // Store raw HTML/JS
        date: new Date().toISOString()
    };
    
    comments.push(comment);
    
    // Remove any security headers
    res.setHeader('X-XSS-Protection', '0');
    res.setHeader('Content-Security-Policy', '');
    res.json({
        success: true,
        message: 'Comment added successfully',
        comment: comment
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Blog server running at http://localhost:${port}`);
}); 