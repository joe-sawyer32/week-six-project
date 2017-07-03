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
  console.log(req.session);
  res.render("index", { errors: req.session.errors });
});

app.post("/login", (req, res) => {
  console.log(req.body);
  delete req.session.errors;
  models.user
    .findOne({ where: { userName: req.body.username } })
    .then(foundUser => {
      //   console.log("username pass");
      if (foundUser) {
        models.user
          .findOne({
            where: { userName: req.body.username, password: req.body.password }
          })
          .then(validUser => {
            //   console.log("password pass");
            if (validUser) {
              req.session.user = validUser.userName;
              console.log("user session: ", req.session);
              res.redirect("/profile");
            } else {
              req.session.errors = {
                invalidPass: "This password does not match the username"
              };
              res.redirect("/");
            }
          });
        //   .catch(error => {

        //   });
      } else {
        req.session.errors = { invalidUser: "This username does not exist" };
        res.redirect("/");
      }
    });
  // .catch(error => {

  // });
});

app.get("/signup", (req, res) => {
  res.render("signup", { errors: req.session.errors });
});

app.post("/signup", (req, res) => {
  console.log(req.body);
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
  res.render("profile");
});

app.listen(port, () => {
  console.log(`Spinning with express: Port ${port}`);
});
