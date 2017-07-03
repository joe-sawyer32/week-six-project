// IMPORTS
const express = require("express");
const app = express();
const port = process.env.port || 8000;
const path = require("path");

const mustacheExpress = require("mustache-express");
const bodyParser = require("body-parser");
const session = require("express-session");
const sessionConfig = require(path.join(__dirname, "/sessionConfig.js"));
const logger = require("morgan");

const checkAuth = require(path.join(__dirname, "/middleware/checkAuth.js"));
// const models = require(path.join(__dirname, "/models"));

// SET VIEW ENGINE
app.engine("mustache", mustacheExpress());
app.set("view engine", "mustache");
app.set("views", path.join(__dirname, "/views"));

// MIDDLEWARE
app.use("/", express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session(sessionConfig));
app.use(logger("dev"));

// ROUTES
app.get("/", (req, res) => {
  console.log(req.session);
  res.render("index");
});

app.post("/login", (req, res) => {
  res.send(req.body);
});

app.get("/signup", (req, res) => {
  res.render("signup", { error: req.session.errors });
});

app.post("/signup", (req, res) => {
  console.log(req.body);
  if (!req.body.username || !req.body.firstPass || !req.body.confirmPass) {
    req.session.errors = { incompleteData: "All fields must be completed" };
    res.redirect("/signup");
  } else if (req.body.firstPass != req.body.confirmPass) {
    req.session.errors = {
      twoDiffPasswords: "Passwords in both fields must match"
    };
  } else {
    // check for new unique username
  }
  res.redirect("/");
});

app.get("/profile", checkAuth, (req, res) => {
  console.log(req.session);
  res.render("profile");
});

app.listen(port, () => {
  console.log(`Spinning with express: Port ${port}`);
});
