// IMPORTS
const express = require("express");
const app = express();
const port = process.env.port || 8000;
const path = require("path");

const mustacheExpress = require("mustache-express");
const bodyParser = require("body-parser");
const session = require("express-session");
const sessionConfig = require(path.join(__dirname, "/sessionConfig"));
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
  res.render("index");
});

app.post("/login", (req, res) => {
  res.send(req.body);
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.get("/profile", checkAuth, (req, res) => {
  res.render("profile");
});

app.listen(port, () => {
  console.log(`Spinning with express: Port ${port}`);
});
