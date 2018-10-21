const { Pool } = require('pg');

//  const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: true
// }); 

 const pool = new Pool({
   connectionString: "postgres://dev:ABC123@localhost/postgres",
   ssl: false
 });

const http = require('http');
var moment = require('moment');
var express = require('express');
const path = require('path');
var bodyParser = require('body-parser');
var app = express();

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/homepage', (req, res) => res.render('pages/homepage'));

app.get('/db', async (req, res) => {
    try {
      const client = await pool.connect()
      const result = await client.query('SELECT * FROM users');
      const results = { 'results': (result) ? result.rows : null};
      res.render('pages/db', results );
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error: " + err);
    }
});
  
// get user fields by id  
app.get('/get-user', async (req, res) => {
  console.log(req.query.id)
      try {
      const client = await pool.connect()
      var id = "id=" + req.query.id;
      const queryResult = await client.query('SELECT * FROM users WHERE ' + id);
      const results = { 'jsonData': (queryResult) ? queryResult.rows : null};
      console.log(results);
      res.send(results.jsonData);
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
});

// update user info
app.get('/update-user', async(req, res) => {
  try {
    const client = await pool.connect();
    // var id = "id=" + req.query.id;
    const queryResult = await client.query('UPDATE users SET fname=($1), lname=($2), email=($3), password=($4) WHERE id=($5)',
    [req.query.fname, req.query.lname, req.query.email, req.query.password, req.query.id]);
    client.release();
    // var fname = "fname=" + req.query.fname;
    // var lname = "lname=" + req.query.lname;
    // var email = "email=" + req.query.email;
    // var password = "password=" + req.query.password;
    // var queryConfig = {
    //   text: 'UPDATE users SET (fname, lname, email, password) VALUES($1, $2, $3, $4) WHERE id;',
    //   values: [req.query.fname, req.query.lname, req.query.email, req.query.password, req.query.id]
    // };
  } catch (err) {
        console.error(err);
    res.send("Error: " + err);
  }
});

// add a new user
app.post('/new-user',function(req,res) {
  var data = [req.body.fname, req.body.lname, req.body.email, req.body.password];
  console.log(data);
  // add new user to user table
  var sql = 'INSERT INTO users (fname, lname, email, password) VALUES ($1, $2, $3, $4) RETURNING id';
  pool.query(sql, data, function(err, result) {
	  console.log("in query");
	  if (err) {
		console.error(err);
	}
	console.log(result.rows[0].id);
})
res.redirect('/db');
});

// get administration page
app.get('/administration', async (req, res) => {
    try {
      const client = await pool.connect()
      const result = await client.query('SELECT * FROM users');
      const results = { 'results': (result) ? result.rows : null};
      res.render('pages/administration', results );
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  });

app.get('/', (req, res) => res.render('pages/login'));

app.use(function(req,res){
  res.status(404);
  res.render('404');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500);
  res.render('500');
});


app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})
