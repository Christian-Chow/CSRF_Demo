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
    <h1>Login</h1>
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
  if (!req.session.user) {
    return res.redirect("/login");
  }

  // HTML for the bank page with the popup
  const bankPageHtml = `
    <h1>Welcome to Simple Bank</h1>
    <p>Logged in as: ${req.session.user}</p>
    <p>Balance: $${bankAccounts[req.session.user].balance}</p>
    <a href="/logout">Logout</a><br><br>
    <a href="/transfer-form">Transfer Funds (Vulnerable)</a>

    
  `;

  res.send(bankPageHtml);
});

app.get("/", (req, res) => {
  const filePath = path.join(__dirname, "public", "attack.html"); // Corrected path
  fs.readFile(filePath, "utf8", (err, html) => {
    if (err) {
      console.error("Error reading HTML file:", err);
      return res.status(500).send("Error serving the HTML");
    }
    res.send(html);
  });
});

// Start the server
app.listen(port, () => {
  console.log(`CSRF bank demo app listening at http://localhost:${port}`);
});

let comments = []; // Store comments in memory (for this example)

// Vulnerable transfer form
app.get("/transfer-form", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  let html = `
    <h1>Transfer Funds (Vulnerable)</h1>
    <p>Logged in as: ${req.session.user}</p>
    <form action="/transfer" method="POST">
      <label>Amount to Transfer: <input type="number" name="amount" value="1000"></label><br>
      <button type="submit">Transfer</button>
    </form>

    <head>
      <title>Vulnerable Comment Section (JavaScript)</title>
    </head>
    <body>
      <h1>Transfer Message</h1>

      <form method="post" action="/comment-success">
        <textarea name="comment"></textarea><br>
        <input type="submit" value="Submit">
      </form>

      <h2>Transfer history:</h2>
  `;
  // Vulnerable: Displaying comments without encoding/sanitization
  // Vulnerable: Displaying comments with date and transfer amount
  comments.forEach((entry) => {
    html += `<p>Date: ${entry.date}, Amount: ${entry.amount}, Comment: ${entry.comment}</p>`; // Directly inserting user input
  });

  // Display comments, encoding them to prevent XSS
  // comments.forEach((comment) => {
  //   const safeComment = sanitizeHtml(comment, {
  //     allowedTags: [], // Disallow all tags
  //     allowedAttributes: {}, // Disallow all attributes
  //   });
  //   html += `<p>${safeComment}</p>`;
  // });

  html += `
    </body>
    </html>
  `;

  res.send(html);
});
app.post("/comment-success", (req, res) => {
  const comment = req.body.comment;
  const now = new Date();
  const dateString = now.toLocaleDateString() + " " + now.toLocaleTimeString();

  comments.push({
    date: dateString,
    amount: transferAmount,
    comment: comment,
  }); // Store the comment, date, and amount

  res.redirect("/transfer-form"); // Redirect back to the home page
});

// Vulnerable transfer processing route (NO CSRF PROTECTION)
app.post("/transfer", (req, res) => {
  // if (!req.session.user) {
  //   return res.redirect('/login');
  // }

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

// <!-- Popup Advertisement -->
//     <div id="popup" style="
//       position: fixed;
//       top: 50%;
//       left: 50%;
//       transform: translate(-50%, -50%);
//       background-color: white;
//       border: 1px solid black;
//       padding: 20px;
//       z-index: 1000;
//       text-align: center;
//     ">
//       <h2>🎉 Congratulations! 🎉</h2>
//       <p>You've been selected for a special offer!</p>
//       <a href="/attack.html">Claim Your Free Gift Card!</a>
//       <button onclick="closePopup()">Close</button>
//     </div>

//     <script>
//       function closePopup() {
//         document.getElementById('popup').style.display = 'none';
//       }
//     </script>
//     <style>
//     #popup {
//       display: block; /* Initially show the popup */
//     }
//     </style>
