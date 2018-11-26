/*
 * App Setup
 */

require("dotenv").config();

const { Pool } = require("pg");
// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: true
// });

const pool = new Pool({
  connectionString: "postgres://dev:ABC123@localhost/postgres",
  ssl: false
});


//require modules
const http = require("http");
var express = require("express");
const path = require("path");
var bodyParser = require("body-parser");
var faker = require("faker");
var moment = require("moment");
var engine = require("ejs-mate");
var crypto = require("crypto");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

//set up passport
var ensureLoggedIn = require("connect-ensure-login").ensureLoggedIn;
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const postgresLocal = require("./lib/passport-local-postgres")(pool);
passport.use(
  new LocalStrategy({ usernameField: "email" }, postgresLocal.localStrategy)
);
passport.serializeUser(postgresLocal.serializeUser);
passport.deserializeUser(postgresLocal.deserializeUser);

//express configuration
var app = express();
app.set("port", process.env.PORT || 5000);
app.use(express.static(__dirname + "/public"));
app.engine("ejs", engine);
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
app.use(require("connect-flash")());
app.use(function (req, res, next) {
  res.locals.messages = require("express-messages")(req, res);
  next();
});
app.locals.moment = moment;

const defaultSignature = "data:image/png;base64,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";

/*
 * User Routes
 */
//show all awards
app.get("/user/awards/index", ensureLoggedIn("/login"), async (req, res) => {
  if (req.user.administrator) res.redirect("/login");
  const client = await pool.connect();
  var result = await client.query(
    `
    SELECT award_types.type as type, users.email as user, awards.id, awards.name, awards.email, awards.time, awards.date
    FROM awards JOIN award_types ON awards.type_id = award_types.id
    JOIN users ON awards.user_id = users.id
    WHERE users.id=($1)
  `,
    [req.user.id]
  );
  const data = { awards: result ? result.rows : null, user: req.user };
  res.render("pages/user/awards/index", data);
  client.release();
});

//delete award
app.post("/user/awards/destroy", ensureLoggedIn("/login"), async (req, res) => {
  if (req.user.administrator) res.redirect("/login");
  const client = await pool.connect();
  await client.query("DELETE FROM awards WHERE id=($1)", [req.body.id]);
  req.flash("info", "Award Deleted");
  res.redirect("/user/awards/index");
  client.release();
});

// form for creating a new award
app.get("/user/awards/new", ensureLoggedIn("/login"), async (req, res) => {
  if (req.user.administrator) res.redirect("/login");
  const client = await pool.connect();
  const result = await client.query("SELECT * FROM award_types");
  const data = { award_types: result ? result.rows : null, user: req.user };
  res.render("pages/user/awards/new", data);
});

//create a new award
app.post("/user/awards/create", ensureLoggedIn("/login"), async (req, res) => {
  if (req.user.administrator) res.redirect("/login");
  const client = await pool.connect();
  await client.query(
    "INSERT INTO awards VALUES(DEFAULT, ($1), ($2), ($3), ($4), ($5), ($6))",
    [
      req.body.type_id,
      req.user.id,
      req.body.name,
      req.body.email,
      req.body.time,
      req.body.date
    ]
  );
  req.flash("info", "Award Created");
  res.redirect("/user/awards/index");
  client.release();
});

//show change name form
app.get("/user/name/edit", ensureLoggedIn("/login"), async (req, res) => {
  if (req.user.administrator) res.redirect("/login");
  const client = await pool.connect();
  var result = await client.query("SELECT * FROM users WHERE id=($1)", [
    req.user.id
  ]);
  const data = { user: result ? result.rows[0] : null };
  res.render("pages/user/name/edit", data);
  client.release();
});

//change name
app.post("/user/name/update", ensureLoggedIn("/login"), async (req, res) => {
  if (req.user.administrator) res.redirect("/login");
  const client = await pool.connect();
  await client.query("UPDATE users SET fname=($1), lname=($2) WHERE id=($3)", [
    req.body.fname,
    req.body.lname,
    req.user.id
  ]);
  req.flash("info", "Name Updated");
  res.redirect("/user/name/edit");
  client.release();
});

/*
 * Admin Routes
 */

app.get("/awardsCreatedReport", ensureLoggedIn("/login"), async (req, res) => {
  try {
    if (!req.user.administrator) res.redirect("/login");
    const client = await pool.connect();
    const queryResult = await client.query(`
      SELECT user_id
      FROM awards
      `);
    const results = { jsonData: queryResult ? queryResult.rows : null };
    console.log(results);
    res.send(results.jsonData);
    client.release();
  } catch (err) {
    console.error(err);
    res.send("Error: " + err);
  }
});

app.get("/displayAllUsers", ensureLoggedIn("/login"), async (req, res) => {
  try {
    if (!req.user.administrator) res.redirect("/login");
    const client = await pool.connect();
    const queryResult = await client.query(`
      SELECT *
      FROM users
      `);
    const results = { jsonData: queryResult ? queryResult.rows : null };
    console.log(results);
    res.send(results.jsonData);
    client.release();
  } catch (err) {
    console.error(err);
    res.send("Error: " + err);
  }
});

app.get("/displayusers", ensureLoggedIn("/login"), async (req, res) => {
  try {
    if (!req.user.administrator) res.redirect("/login");
    const client = await pool.connect();
    const queryResult = await client.query("SELECT * FROM users");
    const data = { jsonData: queryResult ? queryResult.rows : null };
    const results = data.jsonData;
    console.log(results);
    res.render("pages/admin/displayusers", { results: results });
    client.release();
  } catch (err) {
    console.error(err);
    res.send("error " + err);
  }
});

app.get("/edituser", ensureLoggedIn("/login"), async (req, res) => {
  try {
    if (!req.user.administrator) res.redirect("/login");
    const client = await pool.connect();
    const result = await client.query("select * from users");
    const results = { results: result ? result.rows : null };
    res.render("pages/admin/edituser", results);
    client.release();
  } catch (err) {
    console.error(err);
    res.send("error " + err);
  }
});

app.get("/createuser", ensureLoggedIn("/login"), async (req, res) => {
  try {
    if (!req.user.administrator) res.redirect("/login");
    res.render("pages/admin/createuser");
  } catch (err) {
    console.error(err);
    res.send("error " + err);
  }
});

app.get("/reports", ensureLoggedIn("/login"), async (req, res) => {
  try {
    if (!req.user.administrator) res.redirect("/login");
    res.render("pages/admin/reports");
  } catch (err) {
    console.error(err);
    res.send("error " + err);
  }
});

// app.get("/search", ensureLoggedIn("/login"), async (req, res) => {
//   try {
//     if (!req.user.administrator) res.redirect("/login");
//     res.render("pages/admin/search");
//   } catch (err) {
//     console.error(err);
//     res.send("error " + err);
//   }
// });

// get user fields by id
app.get("/get-user", ensureLoggedIn("/login"), async (req, res) => {
  console.log(req.query.id);
  try {
    if (!req.user.administrator) res.redirect("/login");
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
app.get("/delete-user", ensureLoggedIn("/login"), async (req, res) => {
  try {
    if (!req.user.administrator) res.redirect("/login");
    const client = await pool.connect();
    const queryResult = await client.query("DELETE FROM users WHERE id=($1)", [
      req.query.id
    ]);
    client.release();
  } catch (err) {
    console.error(err);
    res.send("Error: " + err);
  }
  res.send("user deleted successfully.");
});

// update user info
app.post("/update-user", ensureLoggedIn("/login"), function (req, res) {
  if (!req.user.administrator) res.redirect("/login");
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
  pool.query(sql, data, function (err, result) {
    if (err) {
      console.error(err);
    }
  });
  res.send("user updated successfully.");
});

// add a new user
app.post("/new-user", ensureLoggedIn("/login"), function (req, res) {
  if (!req.user.administrator) res.redirect("/login");
  var admin = req.body.administrator;
  var isAdmin = admin === "true" ? true : false;
  var data = [
    req.body.fname,
    req.body.lname,
    req.body.email,
    req.body.password,
    req.body.signature,
    isAdmin
  ];
  console.log(data);
  var sql =
    "INSERT INTO users (fname, lname, email, password, signature, administrator) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id";
  pool.query(sql, data, function (err, result) {
    if (err) {
      console.error(err);
    }
    console.log(result.rows[0].administrator);
  });
  res.send("user created successfully.");
});

// get administration page
app.get("/administration", ensureLoggedIn("/login"), async (req, res) => {
  try {
    if (!req.user.administrator) res.redirect("/login");
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
 * Reporting Routes
 */

app.get("/searchForUser", ensureLoggedIn("/login"), async (req, res) => {
  try {
    if (!req.user.administrator) res.redirect("/login");
    const client = await pool.connect();
    console.log(req.query);
    var first = req.query['fname'];
    var last = req.query['lname'];
    var queryResult = await client.query(`
      SELECT id FROM users WHERE fname=($1) AND lname=($2)
    `, [first, last]);
    const results = { jsonData: queryResult ? queryResult.rows : null };
    console.log(results);
    res.send(results.jsonData);
    client.release();
  } catch (err) {
    console.error(err);
    res.send("Error: " + err);
  }
});

// Display all awards as admin
app.get("/displayAllAwards", ensureLoggedIn("/login"), async (req, res) => {
  try {
    if (!req.user.administrator) res.redirect("/login");
    const client = await pool.connect();
    var queryResult = await client.query(`
      SELECT award_types.type, users.email as user, users.fname as fname, users.lname as lname, awards.id, awards.name, awards.email, awards.time, awards.date
      FROM awards JOIN award_types ON awards.type_id = award_types.id
      JOIN users ON awards.user_id = users.id
    `);
    const results = { jsonData: queryResult ? queryResult.rows : null };
    console.log(results);
    res.send(results.jsonData);
    client.release();
  } catch (err) {
    console.error(err);
    res.send("Error: " + err);
  }
});

app.get("/awardsOverTimeReport", ensureLoggedIn("/login"), async (req, res) => {
  try {
    if (!req.user.administrator) res.redirect("/login");
    const client = await pool.connect();
    const queryResult = await client.query(`
      SELECT award_types.type, users.email as user, awards.id, awards.name, awards.email, awards.time, awards.date
      FROM awards JOIN award_types ON awards.type_id = award_types.id
      JOIN users ON awards.user_id = users.id ORDER BY awards.date
      `);
    const results = { jsonData: queryResult ? queryResult.rows : null };
    console.log(results);
    res.send(results.jsonData);
    client.release();
  } catch (err) {
    console.error(err);
    res.send("Error: " + err);
  }
});

/*
 * App routes
 */
app.get("/", async (req, res) => {
  res.redirect("/login");
});

//login page
app.get("/login", async (req, res) => {
  if (req.user === undefined) {
    res.render("pages/login", { user: null });
  } else if (req.user.administrator) {
    res.redirect("/administration");
  } else {
    res.redirect("/user/awards/index");
  }
});

//login validation
app.post(
  "/login/validate",
  passport.authenticate("local", { failureRedirect: "/login" }),
  function (req, res) {
    req.flash("info", "Logged In");
    res.redirect("/login");
  }
);

//logout
app.get("/logout", ensureLoggedIn("/login"), function (req, res) {
  req.logout();
  req.flash("info", "Logged Out");
  res.redirect("/login");
});

//show form for creating a reset password token
app.get("/password", async (req, res) => {
  res.render("pages/password", { user: null });
});

//create a new reset password token and send email
app.post("/password/reset", async (req, res) => {
  const client = await pool.connect();
  var result = await client.query("SELECT * FROM users WHERE email=($1)", [
    req.body.email
  ]);
  if (result.rows.length) {
    reset_token = crypto.randomBytes(4).toString("hex");
    await client.query("UPDATE users SET reset_token=($1) WHERE email=($2)", [
      reset_token,
      req.body.email
    ]);
    const msg = {
      to: req.body.email,
      from: "employee-recognition-app@heroku.com",
      subject: "Reset Password",
      html: `
      <p>Hello ${result.rows[0].fname} ${result.rows[0].lname},</p>
      <p><a href="https://employee-recognition-app.herokuapp.com/password/edit?email=${req.body.email}&reset_token=${reset_token}">Click here to update your password</a></p>
      <p>Thanks,<br>
      Employee Recognition App</p>
      `
    };
    sgMail.send(msg);
  }
  req.flash("info", "Reset password email sent if account exists");
  res.redirect("/login");
  client.release();
});

//show update password form
app.get("/password/edit", async (req, res) => {
  const client = await pool.connect();
  var result = await client.query(
    "SELECT * FROM users WHERE email=($1) AND reset_token=($2)",
    [req.query.email, req.query.reset_token]
  );
  if (result.rows.length && req.query.email && req.query.reset_token) {
    res.render("pages/password/edit", { user: null, query: req.query });
  } else {
    res.redirect("/login");
  }
  client.release();
});

//update password
app.post("/password/update", async (req, res) => {
  const client = await pool.connect();
  await client.query(
    "UPDATE users SET reset_token=($1), password=($2) WHERE email=($3) AND reset_token=($4)",
    [null, req.body.password, req.body.email, req.body.reset_token]
  );
  req.flash("info", "Password Updated");
  res.redirect("/login");
});

//populate data
app.get("/populate", ensureLoggedIn("/login"), async (req, res) => {
  try {
    if (!req.user.administrator) res.redirect("/login");
    // app.get("/populate", async (req, res) => {
    const client = await pool.connect();

    for (i = 0; i < 10; i++) {
      var fName = faker.name.firstName();
      var lName = faker.name.lastName()
      var email = `${fName}.${lName}@user.com`;
      var password = `password`;

      var user = await client.query(
        "INSERT INTO users VALUES(DEFAULT, ($1), ($2), ($3), ($4), DEFAULT, ($5)) RETURNING id",
        [fName, lName, email, password, defaultSignature]
      );

      var times = Math.floor(Math.random() * (10 - 1 + 1)) + 1;
      for (j = 0; j < times; j++) {
        var val = Math.floor(Math.random() * (100 - 1)) + 1;
        var type = (val % 2 === 0) ? "1" : "2";
        await client.query(
          "INSERT INTO awards VALUES(DEFAULT, ($1), ($2), ($3), ($4), ($5), ($6))",
          [
            type,
            user.rows[0].id,
            faker.name.findName(),
            faker.internet.email(),
            "13:45",
            faker.date.past()
          ]
        );
      }
    }
    res.render("pages/populate", { user: null });
    client.release();
  } catch (err) {
    console.error(err);
    res.send("Error: " + err);
  }
});

//reset and set database
app.get("/reset", async (req, res) => {
  const client = await pool.connect();

  //drop tables if exist
  await client.query("DROP TABLE IF EXISTS award_types CASCADE;");
  await client.query("DROP TABLE IF EXISTS users CASCADE;");
  await client.query("DROP TABLE IF EXISTS awards CASCADE;");

  //create tables
  await client.query(`
    CREATE TABLE award_types (
      id serial PRIMARY KEY,
      type varchar(64) NOT NULL
    );
  `);
  await client.query(`
    CREATE TABLE users (
      id serial PRIMARY KEY,
      fname text NOT NULL,
      lname text NOT NULL,
      email text NOT NULL,
      password text NOT NULL,
      reset_token varchar(64),
      signature text NOT NULL,
      administrator bool NOT NULL DEFAULT FALSE
    );
  `);
  await client.query(`
    CREATE TABLE awards (
      id serial PRIMARY KEY,
      type_id integer REFERENCES award_types(id) ON DELETE CASCADE NOT NULL,
      user_id integer REFERENCES users(id) ON DELETE CASCADE NOT NULL,
      name varchar(64) NOT NULL,
      email varchar(64) NOT NULL,
      time time NOT NULL,
      date date NOT NULL
    );
  `);

  //seed database
  var user = await client.query(
    "INSERT INTO users VALUES(DEFAULT, ($1), ($2), ($3), ($4), DEFAULT, ($5)) RETURNING id",
    [faker.name.firstName(), faker.name.lastName(), "user@user.com", "password", defaultSignature]
  );
  var user2 = await client.query(
    "INSERT INTO users VALUES(DEFAULT, ($1), ($2), ($3), ($4), DEFAULT, ($5)) RETURNING id",
    [
      faker.name.firstName(),
      faker.name.lastName(),
      "user2@user.com",
      "password",
      defaultSignature
    ]
  );
  await client.query(
    "INSERT INTO users VALUES(DEFAULT, ($1), ($2), ($3), ($4), DEFAULT, ($5), ($6))",
    [
      faker.name.firstName(),
      faker.name.lastName(),
      "admin@admin.com",
      "password",
      defaultSignature,
      true
    ]
  );
  await client.query("INSERT INTO award_types VALUES(DEFAULT, ($1))", ["Week"]);
  var type = await client.query(
    "INSERT INTO award_types VALUES(DEFAULT, ($1)) RETURNING id",
    ["Month"]
  );
  await client.query(
    "INSERT INTO awards VALUES(DEFAULT, ($1), ($2), ($3), ($4), ($5), ($6))",
    [
      type.rows[0].id,
      user.rows[0].id,
      faker.name.findName(),
      faker.internet.email(),
      "13:45",
      faker.date.past()
    ]
  );
  await client.query(
    "INSERT INTO awards VALUES(DEFAULT, ($1), ($2), ($3), ($4), ($5), ($6))",
    [
      type.rows[0].id,
      user2.rows[0].id,
      faker.name.findName(),
      faker.internet.email(),
      "13:45",
      faker.date.past()
    ]
  );

  res.render("pages/reset", { user: null });
  client.release();
});

app.use(function (req, res) {
  res.status(404);
  res.render("404");
});

app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500);
  res.render("500");
});

app.listen(app.get("port"), function () {
  console.log("Node app is running at localhost:" + app.get("port"));
});