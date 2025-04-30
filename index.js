const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const csurf = require("csurf");

const app = express();
const port = 3000;

// Middleware to parse cookies (required by csurf)
app.use(cookieParser());

// Middleware to parse URL-encoded form data
app.use(bodyParser.urlencoded({ extended: false }));

// Setup csurf middleware with cookie-based CSRF tokens
const csrfProtection = csurf({ cookie: true });

// Serve a simple form with CSRF token included
app.get("/form", csrfProtection, (req, res) => {
  // Send an HTML form with the CSRF token embedded in a hidden input
  //content of the web page
  // This is a simple HTML form that includes a CSRF token in a hidden input field
  res.send(`
    <h1>CSRF Demo Form</h1>
    <form action="/process" method="POST">
      <input type="hidden" name="_csrf" value="${req.csrfToken()}">
      <label>Enter something: <input type="text" name="data"></label>
      <button type="submit">Submit</button>
    </form>
  `);
});

// Process form submission with CSRF protection
app.post("/process", csrfProtection, (req, res) => {
  res.send(`Form data received safely: ${req.body.data}`);
});

// Start the server
app.listen(port, () => {
  console.log(`CSRF demo app listening at http://localhost:${port}/form`);
});
