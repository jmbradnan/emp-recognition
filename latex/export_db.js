const pg = require('pg');
const fs = require('fs');
const copyTo = require('pg-copy-streams').to;

const export_email_sender = fs.createWriteStream('email_sender.txt'); //write email address of sender to file
const export_email_recipient = fs.createWriteStream('email_recipient.txt'); //write email address of recipient to file
const export_e_signature = fs.createWriteStream('e_sig.txt'); //write electronic signature data URI to file
const export_csv = fs.createWriteStream('cert_data.csv'); //write award data to file

const pool = new pg.Pool({
	user: 'lszxgtdwwniwwq',
	host: 'ec2-54-243-147-162.compute-1.amazonaws.com',
	database: 'dbi0l4fuki7pgh',
	password: '1d2225888a02606eb86d32787576c7db3dd4786b1fcf6508cb1fc27e7cef435e',
	port: '5432'
});

pool.connect(function(err, client, done) {

  //query email address of sender
  var stream = client.query(copyTo('COPY (SELECT users.email FROM awards INNER JOIN users ON awards.user_id = users.id ORDER BY awards.id DESC LIMIT 1) TO STDOUT'));
  stream.pipe(export_email_sender);

  //query email address of recipient
  stream = client.query(copyTo('COPY (SELECT email FROM awards ORDER BY id DESC LIMIT 1) TO STDOUT'));
  stream.pipe(export_email_recipient);

  //query electronic signature of user giving award
  stream = client.query(copyTo('COPY (SELECT users.signature FROM awards INNER JOIN users ON awards.user_id = users.id ORDER BY awards.id DESC LIMIT 1) TO STDOUT'));
  stream.pipe(export_e_signature);

  //query data for award creation 
  stream = client.query(copyTo('COPY (SELECT award_types.type, awards.name, awards.date, users.fname, users.lname FROM award_types INNER JOIN awards ON awards.type_id = award_types.id INNER JOIN users ON awards.user_id = users.id ORDER BY awards.id DESC LIMIT 1) TO STDOUT WITH CSV HEADER'));
  stream.pipe(export_csv);

  stream.on('end', done);
  stream.on('error', done);
});

pool.end();