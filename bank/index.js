const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const csurf = require("csurf");
const session = require("express-session"); // Add this

const app = express();
const port = 3000;

// Middleware
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  session({
    // Configure session middleware
    secret: "your-secret-key", // Replace with a strong, random string
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set to true in production (HTTPS)
  })
);

// Serve static files from the 'public' directory
app.use(express.static("public"));

// CSRF protection
const csrfProtection = csurf({ cookie: true });

// In-memory "database" for user account
const bankAccounts = {
  user1: { balance: 1000 },
};

// Login route
app.get("/login", (req, res) => {
  // Basic "login" form
  res.send(`
    <h1>Insecure Bank Login</h1>
    <form action="/login" method="POST">
      <label>Username: <input type="text" name="username" value="user1"></label><br>
      <button type="submit">Login</button>
    </form>
  `);
});

app.post("/login", (req, res) => {
  // Simulate authentication
  req.session.user = req.body.username;
  res.redirect("/bank");
});

// Logout route
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
    }
    res.redirect("/login");
  });
});

// Bank page (requires login)
app.get("/bank", (req, res) => {
  if (!req.session.user || !bankAccounts[req.session.user]) {
    return res.redirect("/login");
  }

  // HTML for the bank page with the popup
  const bankPageHtml = `
    <h1>Welcome to InsecureBank</h1>
    <p>Logged in as: ${req.session.user}</p>
    <p>Balance: $${bankAccounts[req.session.user].balance}</p>
    <a href="/logout">Logout</a><br><br>
    <a href="/transfer-form">Transfer Funds (Vulnerable)</a>
  `;

  res.send(bankPageHtml);
});

app.get("/", (req, res) => {
  res.redirect("/login");
});

// Start the server
app.listen(port, () => {
  console.log(`CSRF bank demo app listening at http://localhost:${port}`);
});

// Vulnerable transfer form
app.get("/transfer-form", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  res.send(`
    <h1>Transfer Funds (Vulnerable)</h1>
    <p>Logged in as: ${req.session.user}</p>
    <form action="/transfer" method="POST">
      <label>Amount to Transfer: <input type="number" name="amount" value="1000"></label><br>
      <button type="submit">Transfer</button>
    </form>
  `);
});

// Vulnerable transfer processing route (NO CSRF PROTECTION)
app.post("/transfer", (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  const amount = parseInt(req.body.amount);
  if (amount > 0 && bankAccounts[req.session.user].balance >= amount) {
    bankAccounts[req.session.user].balance -= amount;
    res.send(`
      <h1>Transfer Successful!</h1>
      <p>Amount transferred: $${amount}</p>
      <p>New Balance: $${bankAccounts[req.session.user].balance}</p>
      <a href="/bank">Back to Bank</a>
    `);
  } else {
    res.send(`
      <h1>Transfer Failed!</h1>
      <p>Insufficient funds or invalid amount.</p>
      <a href="/bank">Back to Bank</a>
    `);
  }
});

let comments = []; // Store comments in memory (for this example)

app.get("/comment", (req, res) => {
  // Generate the HTML dynamically with comments
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Vulnerable Comment Section (JavaScript)</title>
    </head>
    <body>
      <h1>Leave a Comment</h1>

      <form method="post" action="/comment-success">
        <textarea name="comment"></textarea><br>
        <input type="submit" value="Submit">
      </form>

      <h2>Comments:</h2>
  `;

  // Display comments, encoding them to prevent XSS
  // comments.forEach((comment) => {
  //   const safeComment = sanitizeHtml(comment, {
  //     allowedTags: [], // Disallow all tags
  //     allowedAttributes: {}, // Disallow all attributes
  //   });
  //   html += `<p>${safeComment}</p>`;
  // });

  // Vulnerable: Displaying comments without encoding/sanitization
  comments.forEach((comment) => {
    html += `<p>${comment}</p>`; // Directly inserting user input
  });

  html += `
    </body>
    </html>
  `;

  res.send(html);
});

app.post("/comment-success", (req, res) => {
  const comment = req.body.comment;
  comments.push(comment); // Store the comment

  res.redirect("/comment"); // Redirect back to the home page
});
