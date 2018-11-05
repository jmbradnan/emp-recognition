// /*
//  * App Setup
//  */

// require("dotenv").config();

// const { Pool } = require("pg");

// // const pool = new Pool({
// //   connectionString: process.env.DATABASE_URL,
// //   ssl: true
// // });

// const pool = new Pool({
//   connectionString: "postgres://dev:ABC123@localhost/postgres",
//   ssl: false
// });


const http = require("http");
var moment = require("moment");
var express = require("express");
const path = require("path");
var bodyParser = require("body-parser");

var app = express();
app.set("port", process.env.PORT || 5000);
app.use(express.static(__dirname + "/public"));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.locals.moment = moment;


/*
 * Admin Routes
 */
module.exports = function(app){

// Show abbreviated list (names) of all users
app.get("/show-all-users", async (req, res) => {
  try {
    const client = await pool.connect();
    const queryResult = await client.query("SELECT * FROM users");
    const results = { jsonData: queryResult ? queryResult.rows : null };
    // res.send(results.jsonData);
    // const results = { results: result ? result.rows : null };
    res.render("pages/administration", results);
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
    res.render("pages/admin/displayusers", {'results': results });
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
    res.render('pages/admin/createuser');
  } catch (err) {
    console.error(err);
    res.send("error " + err);
  }
});

app.get("/reports", async (req, res) => {
  try {
    res.render('pages/admin/reports');
  } catch (err) {
    console.error(err);
    res.send("error " + err);
  }
});

app.get("/search", async (req, res) => {
  try {
    res.render('pages/admin/search');
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
    var data =       [
        req.body.id,
        req.body.fname,
        req.body.lname,
        req.body.email,
        req.body.password,
        req.body.signature
      ];
    console.log(data);
    var sql = "UPDATE users SET fname=($2), lname=($3), email=($4), password=($5), signature=($6) WHERE id=($1)";
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

}
