/*
 * App Setup
 */

require("dotenv").config();

const { Pool } = require("pg");
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

const http = require("http");
var moment = require("moment");
var express = require("express");
const path = require("path");
var bodyParser = require("body-parser");
var faker = require("faker");
var moment = require("moment");
var ensureLoggedIn = require("connect-ensure-login").ensureLoggedIn;

const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const postgresLocal = require("./lib/passport-local-postgres")(pool);
passport.use(
  new LocalStrategy({ usernameField: "email" }, postgresLocal.localStrategy)
);
passport.serializeUser(postgresLocal.serializeUser);
passport.deserializeUser(postgresLocal.deserializeUser);

var app = express();
app.set("port", process.env.PORT || 5000);
app.use(express.static(__dirname + "/public"));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(require("morgan")("tiny"));
app.use(require("cookie-parser")());
app.use(require("body-parser").urlencoded({ extended: true }));
app.use(
  require("express-session")({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.locals.moment = moment;

/*
 * User Routes
 */

//user login page
app.get("/user/login", async (req, res) => {
  try {
    res.render("pages/user/login");
  } catch (err) {
    console.error(err);
    res.send("Error: " + err);
  }
});

//user login validation
app.post(
  "/user/login/validate",
  passport.authenticate("local", { failureRedirect: "/user/login" }),
  function(req, res) {
    res.redirect("/user/home");
  }
);

//user homepage
app.get("/user/home", ensureLoggedIn("/user/login"), function(req, res) {
  console.log(req);
  res.render("pages/user/home");
});

//user logout
app.get("/user/logout", function(req, res) {
  req.logout();
  res.redirect("/user/login");
});

//create award
app.post(
  "/user/award/create",
  ensureLoggedIn("/user/login"),
  async (req, res) => {
    try {
      const client = await pool.connect();
      await client.query(
        "INSERT INTO awards VALUES(DEFAULT, ($1), ($2), ($3), ($4))",
        [req.body.name, req.body.email, req.body.time, req.body.date]
      );
      res.redirect("/user/awards");
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error: " + err);
    }
  }
);

//show all awards
app.get("/user/awards", ensureLoggedIn("/user/login"), async (req, res) => {
  try {
    const client = await pool.connect();
    var result = await client.query("SELECT * FROM awards");
    const awards = { awards: result ? result.rows : null };
    res.render("pages/user/awards", awards);
    client.release();
  } catch (err) {
    console.error(err);
    res.send("Error: " + err);
  }
});

//reset user database
app.get("/user/reset", async (req, res) => {
  try {
    const client = await pool.connect();
    await client.query("DROP TABLE IF EXISTS awards;");
    await client.query(`
      CREATE TABLE awards (
        id serial PRIMARY KEY,
        name varchar(64) NOT NULL,
        email varchar(64) NOT NULL,
        time time NOT NULL,
        date date NOT NULL
      );
    `);
    await client.query(
      "INSERT INTO awards VALUES(DEFAULT, ($1), ($2), ($3), ($4))",
      [
        faker.name.findName(),
        faker.internet.email(),
        "04:05",
        faker.date.past()
      ]
    );
    res.render("pages/user/reset");
    client.release();
  } catch (err) {
    console.error(err);
    res.send("Error: " + err);
  }
});

/*
 * Admin Routes
 */

// Show abbreviated list (names) of all users
app.get("/show-all-users", async (req, res) => {
  try {
    const client = await pool.connect();
    const queryResult = await client.query("SELECT * FROM users");
    const results = { jsonData: queryResult ? queryResult.rows : null };
    res.send(results.jsonData);
    // const results = { results: result ? result.rows : null };
    // res.render("pages/administration", results);
    client.release();
  } catch (err) {
    console.error(err);
    res.send("Error: " + err);
  }
});

// get user fields by id
app.get("/get-user", async (req, res) => {
  console.log(req.query.id);
  try {
    const client = await pool.connect();
    var id = "id=" + req.query.id;
    const queryResult = await client.query("SELECT * FROM users WHERE " + id);
    const results = { jsonData: queryResult ? queryResult.rows : null };
    console.log(results);
    res.send(results.jsonData);
    client.release();
  } catch (err) {
    console.error(err);
    res.send("Error " + err);
  }
});

// delete user
app.get("/delete-user", async (req, res) => {
  try {
    const client = await pool.connect();
    const queryResult = await client.query("DELETE FROM users WHERE id=($1)", [
      req.query.id
    ]);
    client.release();
  } catch (err) {
    console.error(err);
    res.send("Error: " + err);
  }
});

// update user info
app.post("/update-user", function(req, res) {
  var data = [
    req.body.id,
    req.body.fname,
    req.body.lname,
    req.body.email,
    req.body.password,
    req.body.signature
  ];
  console.log(data);
  var sql =
    "UPDATE users SET fname=($2), lname=($3), email=($4), password=($5), signature=($6) WHERE id=($1)";
  pool.query(sql, data, function(err, result) {
    if (err) {
      console.error(err);
    }
  });
  res.redirect("/administration");
});

// add a new user
app.post("/new-user", function(req, res) {
  var data = [
    req.body.fname,
    req.body.lname,
    req.body.email,
    req.body.password,
    req.body.signature
  ];
  console.log(data);
  var sql =
    "INSERT INTO users (fname, lname, email, password, signature) VALUES ($1, $2, $3, $4, $5) RETURNING id";
  pool.query(sql, data, function(err, result) {
    if (err) {
      console.error(err);
    }
    console.log(result.rows[0].id);
  });
  res.redirect("/administration");
});

// get administration page
app.get("/administration", async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query("select * from users");
    const results = { results: result ? result.rows : null };
    res.render("pages/admin/administration", results);
    client.release();
  } catch (err) {
    console.error(err);
    res.send("error " + err);
  }
});

/*
 * App routes
 */
app.get("/", async (req, res) => {
  try {
    res.redirect("/user/login");
  } catch (err) {
    console.error(err);
    res.send("error " + err);
  }
});

app.use(function(req, res) {
  res.status(404);
  res.render("404");
});

app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500);
  res.render("500");
});

app.listen(app.get("port"), function() {
  console.log("Node app is running at localhost:" + app.get("port"));
});
