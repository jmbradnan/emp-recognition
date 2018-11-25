const pg = require('pg');
const fs = require('fs');
const copyTo = require('pg-copy-streams').to;

const export_email_sender = fs.createWriteStream(__dirname + '/email_sender.txt'); //write sender address
const export_email_recipient = fs.createWriteStream(__dirname + '/email_recipient.txt'); //write receiver address
const export_e_signature = fs.createWriteStream(__dirname + '/e_sig.txt'); //write data URI of electronic signature
const export_csv = fs.createWriteStream(__dirname + '/cert_data.csv'); //write certificate data 

const { Pool } = require("pg");
const pool = new Pool({
 connectionString: "postgres://lszxgtdwwniwwq:1d2225888a02606eb86d32787576c7db3dd4786b1fcf6508cb1fc27e7cef435e@ec2-54-243-147-162.compute-1.amazonaws.com:5432/dbi0l4fuki7pgh",
 ssl:true
});

pool.connect(function(err, client, done) {
  //get sender email
  var stream = client.query(copyTo('COPY (SELECT users.email FROM awards INNER JOIN users ON awards.user_id = users.id ORDER BY awards.id DESC LIMIT 1) TO STDOUT'));
  stream.pipe(export_email_sender);
  //get receiver email
  stream = client.query(copyTo('COPY (SELECT email FROM awards ORDER BY id DESC LIMIT 1) TO STDOUT'));
  stream.pipe(export_email_recipient);
  //get electronic signature 
  stream = client.query(copyTo('COPY (SELECT users.signature FROM awards INNER JOIN users ON awards.user_id = users.id ORDER BY awards.id DESC LIMIT 1) TO STDOUT'));
  stream.pipe(export_e_signature);
  //get certificate data
  stream = client.query(copyTo('COPY (SELECT award_types.type, awards.name, awards.date, users.fname, users.lname FROM award_types INNER JOIN awards ON awards.type_id = award_types.id INNER JOIN users ON awards.user_id = users.id ORDER BY awards.id DESC LIMIT 1) TO STDOUT WITH CSV HEADER'));
  stream.pipe(export_csv);

  stream.on('end', done);
  stream.on('error', done);
});

pool.end();