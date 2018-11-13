/*
 * App Setup
 */

require("dotenv").config();

const { Pool } = require("pg");
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
  //ssl: true
});

//require modules
const http = require("http");
var moment = require("moment");
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
app.locals.moment = moment;

/*
 * User Routes
 */

//user login page
app.get("/user/login", async (req, res) => {
  try {
    if (req.user === undefined) {
      res.render("pages/user/login", { user: null });
    } else {
      res.redirect("/user/home");
    }
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
app.get("/user/home", ensureLoggedIn("/user/login"), async (req, res) => {
  try {
    app.locals.user = req.user;
    const client = await pool.connect();
    const result = await client.query("SELECT * FROM award_types");
    const data = { award_types: result ? result.rows : null, user: req.user };
    res.render("pages/user/home", data);
  } catch (err) {
    console.error(err);
    res.send("Error: " + err);
  }
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
    var result = await client.query(`
      SELECT award_types.name as type, users.email as user, awards.id, awards.name, awards.email, awards.time, awards.date
      FROM awards JOIN award_types ON awards.type_id = award_types.id
      JOIN users ON awards.user_id = users.id
    `);
    const data = { awards: result ? result.rows : null, user: req.user };
    res.render("pages/user/awards", data);
    client.release();
  } catch (err) {
    console.error(err);
    res.send("Error: " + err);
  }
});

//delete award
app.post(
  "/user/award/delete",
  ensureLoggedIn("/user/login"),
  async (req, res) => {
    try {
      const client = await pool.connect();
      await client.query("DELETE FROM awards WHERE id=($1)", [req.body.id]);
      res.redirect("/user/awards");
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error: " + err);
    }
  }
);

//show change name form
app.get("/user/name", ensureLoggedIn("/user/login"), async (req, res) => {
  try {
    const client = await pool.connect();
    var result = await client.query("SELECT * FROM users WHERE id=($1)", [
      req.user.id
    ]);
    const data = { user: result ? result.rows[0] : null };
    res.render("pages/user/name", data);
    client.release();
  } catch (err) {
    console.error(err);
    res.send("Error: " + err);
  }
});

//change name
app.post("/user/name/edit", ensureLoggedIn("/user/login"), async (req, res) => {
  try {
    const client = await pool.connect();
    await client.query(
      "UPDATE users SET fname=($1), lname=($2) WHERE id=($3)",
      [req.body.fname, req.body.lname, req.user.id]
    );
    res.redirect("/user/name");
    client.release();
  } catch (err) {
    console.error(err);
    res.send("Error: " + err);
  }
});

/*
 * Admin Routes
 */

app.get("/awardsCreatedReport", async (req, res) => {
  try {
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

app.get("/displayusers", async (req, res) => {
  try {
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

app.get("/edituser", async (req, res) => {
  try {
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

app.get("/createuser", async (req, res) => {
  try {
    res.render("pages/admin/createuser");
  } catch (err) {
    console.error(err);
    res.send("error " + err);
  }
});

app.get("/reports", async (req, res) => {
  try {
    res.render("pages/admin/reports");
  } catch (err) {
    console.error(err);
    res.send("error " + err);
  }
});

app.get("/search", async (req, res) => {
  try {
    res.render("pages/admin/search");
  } catch (err) {
    console.error(err);
    res.send("error " + err);
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
  res.send("user deleted successfully.");
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
  // res.redirect("/administration");
  res.send("user updated successfully.");
});

// add a new user
app.post("/new-user", function(req, res) {
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
  pool.query(sql, data, function(err, result) {
    if (err) {
      console.error(err);
    }
    console.log(result.rows[0].administrator);
  });
  // res.redirect("/administration");
  res.send("user created successfully.");
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

//show password reset form
app.get("/password", async (req, res) => {
  try {
    res.render("pages/password", { user: null, alert: req.query.alert });
  } catch (err) {
    console.error(err);
    res.send("error " + err);
  }
});

//send reset pasword email
app.post("/password/reset", async (req, res) => {
  try {
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
        <a href="https://employee-recognition-app.herokuapp.com/password/update?email=${
          req.body.email
        }&reset_token=${reset_token}">Click here to update your password</a>
        <p>Thanks,<br>
        Employee Recognition App</p>
        `
      };
      sgMail.send(msg);
    }
    res.redirect("/password");
    client.release();
  } catch (err) {
    console.error(err);
    res.send("error " + err);
  }
});

//show update password form
app.get("/password/update", async (req, res) => {
  try {
    const client = await pool.connect();
    var result = await client.query(
      "SELECT * FROM users WHERE email=($1) AND reset_token=($2)",
      [req.query.email, req.query.reset_token]
    );
    if (result.rows.length && req.query.email && req.query.reset_token) {
      res.render("pages/password/update", { user: null, req: req });
    } else {
      res.redirect("/user/login");
    }
    client.release();
  } catch (err) {
    console.error(err);
    res.send("error " + err);
  }
});

//update password
app.post("/password/update", async (req, res) => {
  try {
    const client = await pool.connect();
    await client.query(
      "UPDATE users SET reset_token=($1), password=($2) WHERE email=($3) AND reset_token=($4)",
      [null, req.body.password, req.body.email, req.body.reset_token]
    );
    res.redirect("/user/login");
  } catch (err) {
    console.error(err);
    res.send("error " + err);
  }
});

//reset and set database
app.get("/reset", async (req, res) => {
  try {
    const client = await pool.connect();

    //drop tables if exist
    await client.query("DROP TABLE IF EXISTS award_types CASCADE;");
    await client.query("DROP TABLE IF EXISTS users CASCADE;");
    await client.query("DROP TABLE IF EXISTS awards CASCADE;");

    //create tables
    await client.query(`
      CREATE TABLE award_types (
        id serial PRIMARY KEY,
        name varchar(64) NOT NULL
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
        signature text,
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
      "INSERT INTO users VALUES(DEFAULT, ($1), ($2), ($3), ($4)) RETURNING id",
      [
        faker.name.firstName(),
        faker.name.lastName(),
        "admin@admin.com",
        "password"
      ]
    );
    await client.query("INSERT INTO award_types VALUES(DEFAULT, ($1))", [
      "Week"
    ]);
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

    res.render("pages/reset", { user: null });
    client.release();
  } catch (err) {
    console.error(err);
    res.send("Error: " + err);
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
