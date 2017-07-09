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

function parseMessages(messages) {
  messages.forEach(msg => {
    console.log(
      `message ${msg.id}: ${msg.body} has `,
      msg.likes.length,
      ` likes`
    );
  });
}

// ROUTES
app.get("/", (req, res) => {
  res.render("index", { errors: req.session.errors });
});

app.post("/login", (req, res) => {
  // need data validation functions for inputs
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
              id: foundUser.id,
              name: foundUser.displayName
            };
            res.redirect("/messages");
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
      })
      .catch(error => {
        res.status(500).send(error);
      });
  }
});

app.get("/signup", (req, res) => {
  res.render("signup", { errors: req.session.errors });
});

app.post("/signup", (req, res) => {
  // need data validation functions for inputs
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
        req.session.user = { id: addedUser.id, name: req.body.displayName };
        res.redirect("/messages");
      })
      .catch(error => {
        if (error.name == "SequelizeUniqueConstraintError") {
          req.session.errors = { notNewUser: "This username is already taken" };
          res.redirect("/signup");
        } else {
          res.status(500).send(error);
        }
      });
  }
});

app.get("/messages", checkAuth, (req, res) => {
  models.message
    .findAll({
      include: [
        { model: models.user, as: "author", attributes: ["displayName"] },
        {
          model: models.like,
          as: "likes",
          attributes: ["likerId", "messageId"]
        }
      ],
      order: [["createdAt", "DESC"]],
      attributes: ["id", "body", "authorId", "createdAt"]
    })
    .then(foundMessages => {
      parseMessages(foundMessages);
      //   res.render("messages", {
      //     name: req.session.user.name,
      //     messages: foundMessages
      //   });
      res.send(foundMessages);
    })
    .catch(error => {
      res.status(500).send(error);
    });
});

app.get("/create", checkAuth, (req, res) => {
  res.render("create");
});

app.post("/message", checkAuth, (req, res) => {
  var newMessage = models.message.build({
    body: req.body.message,
    authorId: req.session.user.id
  });
  newMessage
    .save()
    .then(addedMessage => {
      res.redirect("messages");
    })
    .catch(error => {
      // more specific error handling
      res.status(500).send(error);
    });
});

app.post("/like", checkAuth, (req, res) => {
  var newLike = models.like.build({
    likerId: req.session.user.id,
    messageId: req.body.message
  });
  newLike
    .save()
    .then(() => {
      res.redirect("messages");
    })
    .catch(error => {
      // more specific error handling
      res.status(500).send(error);
    });
});

app.get("/logout", checkAuth, (req, res) => {
  req.session.destroy();
  res.render("logout");
});

app.listen(port, () => {
  console.log(`Spinning with express: Port ${port}`);
});
