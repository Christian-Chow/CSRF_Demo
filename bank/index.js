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
  user1: { balance: 10050 },
};

// Login route
app.get("/login", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Insecure Bank Login</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: #f0f2f5;
          margin: 0;
          padding: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
        }
        .container {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          width: 100%;
          max-width: 400px;
        }
        h1 {
          color: #1a237e;
          margin-bottom: 1.5rem;
          text-align: center;
        }
        form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        label {
          display: block;
          margin-bottom: 0.5rem;
          color: #333;
        }
        input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
          box-sizing: border-box;
        }
        button {
          background: #1a237e;
          color: white;
          border: none;
          padding: 0.75rem;
          border-radius: 4px;
          font-size: 1rem;
          cursor: pointer;
          transition: background 0.3s;
        }
        button:hover {
          background: #0d47a1;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Insecure Bank Login</h1>
        <form action="/login" method="POST">
          <label>Username: <input type="text" name="username" value="user1"></label>
          <button type="submit">Login</button>
        </form>
      </div>
    </body>
    </html>
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

  const bankPageHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>InsecureBank</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: #f0f2f5;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 800px;
          margin: 2rem auto;
          padding: 2rem;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 {
          color: #1a237e;
          margin-bottom: 1.5rem;
        }
        .balance-card {
          background: #e3f2fd;
          padding: 1.5rem;
          border-radius: 8px;
          margin: 1.5rem 0;
        }
        .balance-amount {
          font-size: 2rem;
          font-weight: bold;
          color: #1a237e;
        }
        .actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }
        .button {
          display: inline-block;
          padding: 0.75rem 1.5rem;
          background: #1a237e;
          color: white;
          text-decoration: none;
          border-radius: 4px;
          transition: background 0.3s;
        }
        .button:hover {
          background: #0d47a1;
        }
        .button.logout {
          background: #b71c1c;
        }
        .button.logout:hover {
          background: #c62828;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Welcome to InsecureBank (Comp4632 Demo)</h1>
        <p>Logged in as: <strong>${req.session.user}</strong></p>
        <div class="balance-card">
          <h2>Your Balance</h2>
          <div class="balance-amount">$${bankAccounts[req.session.user].balance}</div>
        </div>
        <div class="actions">
          <a href="/transfer-form" class="button">Transfer Funds</a>
          <a href="/logout" class="button logout">Logout</a>
        </div>
      </div>
    </body>
    </html>
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

// Transfer form
app.get("/transfer-form", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Transfer Funds</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: #f0f2f5;
          margin: 0;
          padding: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
        }
        .container {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          width: 100%;
          max-width: 500px;
        }
        h1 {
          color: #1a237e;
          margin-bottom: 1.5rem;
        }
        form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        label {
          display: block;
          margin-bottom: 0.5rem;
          color: #333;
        }
        input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
          box-sizing: border-box;
        }
        .button-group {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }
        button, .button {
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          font-size: 1rem;
          cursor: pointer;
          transition: background 0.3s;
          text-decoration: none;
          text-align: center;
        }
        button {
          background: #1a237e;
          color: white;
          border: none;
        }
        button:hover {
          background: #0d47a1;
        }
        .button {
          background: #e0e0e0;
          color: #333;
        }
        .button:hover {
          background: #bdbdbd;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Transfer Funds</h1>
        <p>Logged in as: <strong>${req.session.user}</strong></p>
        <form action="/transfer" method="POST">
          <label>Amount to Transfer: <input type="number" name="amount" value="1000"></label>
          <div class="button-group">
            <button type="submit">Transfer</button>
            <a href="/bank" class="button">Cancel</a>
          </div>
        </form>
      </div>
    </body>
    </html>
  `);
});

// Transfer result
app.post("/transfer", (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  const amount = parseInt(req.body.amount);
  let resultHtml = '';
  if (amount > 0 && bankAccounts[req.session.user].balance >= amount) {
    bankAccounts[req.session.user].balance -= amount;
    resultHtml = `
      <div class="result success">
        <h1>Transfer Successful!</h1>
        <p>Amount transferred: <strong>$${amount}</strong></p>
        <p>New Balance: <strong>$${bankAccounts[req.session.user].balance}</strong></p>
      </div>
    `;
  } else {
    resultHtml = `
      <div class="result error">
        <h1>Transfer Failed!</h1>
        <p>Insufficient funds or invalid amount.</p>
      </div>
    `;
  }

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Transfer Result</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: #f0f2f5;
          margin: 0;
          padding: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
        }
        .container {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          width: 100%;
          max-width: 500px;
          text-align: center;
        }
        .result {
          margin-bottom: 2rem;
        }
        .result.success h1 {
          color: #2e7d32;
        }
        .result.error h1 {
          color: #c62828;
        }
        .button {
          display: inline-block;
          padding: 0.75rem 1.5rem;
          background: #1a237e;
          color: white;
          text-decoration: none;
          border-radius: 4px;
          transition: background 0.3s;
        }
        .button:hover {
          background: #0d47a1;
        }
      </style>
    </head>
    <body>
      <div class="container">
        ${resultHtml}
        <a href="/bank" class="button">Back to Bank</a>
      </div>
    </body>
    </html>
  `);
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
