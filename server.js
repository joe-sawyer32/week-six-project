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
const models = require(path.join(__dirname, "/models"));

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
  res.render("index", { errors: req.session.errors });
});

app.post("/login", (req, res) => {
  delete req.session.errors;
  if (!req.body || !req.body.username || !req.body.password) {
    req.session.errors = { incompleteData: "All fields must be completed" };
    res.redirect("/");
  } else {
    models.user
      .findOne({ where: { userName: req.body.username } })
      .then(foundUser => {
        if (foundUser) {
          if (foundUser.password == req.body.password) {
            req.session.user = {
              username: foundUser.userName,
              name: foundUser.displayName
            };
            res.redirect("/profile");
          } else {
            req.session.errors = {
              invalidPass: "This password does not match the username"
            };
            res.redirect("/");
          }
          //     });
        } else {
          req.session.errors = { invalidUser: "This username does not exist" };
          res.redirect("/");
        }
      });
  }
});

app.get("/signup", (req, res) => {
  res.render("signup", { errors: req.session.errors });
});

app.post("/signup", (req, res) => {
  delete req.session.errors;
  if (
    !req.body.username ||
    !req.body.displayName ||
    !req.body.password ||
    !req.body.confirmPass
  ) {
    req.session.errors = { incompleteData: "All fields must be completed" };
    res.redirect("/signup");
  } else if (req.body.password != req.body.confirmPass) {
    req.session.errors = {
      twoDiffPasswords: "Passwords in both fields must match"
    };
    res.redirect("/signup");
  } else {
    var newUser = models.user.build({
      userName: req.body.username,
      password: req.body.password,
      displayName: req.body.displayName
    });
    newUser
      .save()
      .then(addedUser => {
        req.session.user = { username: req.body.username };
        res.redirect("/profile");
      })
      .catch(Sequelize.UniqueConstraintError, error => {
        req.session.errors = { notNewUser: "This username is already taken" };
        res.redirect("/signup");
      });
  }
});

app.get("/profile", checkAuth, (req, res) => {
  console.log(req.session);
  res.render("profile", { name: req.session.user.name });
});

app.get("/logout", checkAuth, (req, res) => {
  req.session.destroy();
  res.render("logout");
});

app.listen(port, () => {
  console.log(`Spinning with express: Port ${port}`);
});
