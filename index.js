const { Pool } = require('pg');
/* app.use(express.static('public')); */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

/* const pool = new Pool({
  connectionString: "postgres://dev:ABC123@localhost/postgres",
  ssl: false
}); */
const http = require('http');
var bodyParser = require('body-parser');
var moment = require('moment'); 
var express = require('express');
const path = require('path');
var app = express();

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.get('/', (req, res) => res.render('pages/index'));
/* 
app.get('/', function(request, response) {
  response.send('Hello World!')
}) */

app.get('/db', async (req, res) => {
    try {
      const client = await pool.connect()
      const result = await client.query('SELECT * FROM users');
      const results = { 'results': (result) ? result.rows : null};
      res.render('pages/db', results );
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  });
  
  
//add a new user 
app.post('/new-user',function(req,res){
  var data = [req.body.fname, req.body.lname, req.body.email, req.body.password];  
  console.log(data);
  //add new user to user table
/*   pool.query("INSERT INTO users SET ?", post, function(err, result){
    if(err){
      next(err);
      return;
    }
}) */
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
