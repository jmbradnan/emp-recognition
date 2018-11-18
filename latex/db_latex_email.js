const pg = require('pg');
const fs = require('fs');
const copyTo = require('pg-copy-streams').to;

const export_email_sender = fs.createWriteStream('email_sender.txt');
const export_email_recipient = fs.createWriteStream('email_recipient.txt');
const export_csv = fs.createWriteStream('cert_data.csv');

const pool = new pg.Pool({
	user: 'lszxgtdwwniwwq',
	host: 'ec2-54-243-147-162.compute-1.amazonaws.com',
	database: 'dbi0l4fuki7pgh',
	password: '1d2225888a02606eb86d32787576c7db3dd4786b1fcf6508cb1fc27e7cef435e',
	port: '5432'
});

pool.connect(function(err, client, done) {

  var stream = client.query(copyTo('COPY (SELECT users.email FROM awards INNER JOIN users ON awards.user_id = users.id ORDER BY awards.id DESC LIMIT 1) TO STDOUT'));
  stream.pipe(export_email_sender);

  stream = client.query(copyTo('COPY (SELECT email FROM awards ORDER BY id DESC LIMIT 1) TO STDOUT'));
  stream.pipe(export_email_recipient);

  stream = client.query(copyTo('COPY (SELECT award_types.type, awards.name, awards.date, users.fname, users.lname FROM award_types INNER JOIN awards ON awards.type_id = award_types.id INNER JOIN users ON awards.user_id = users.id ORDER BY awards.id DESC LIMIT 1) TO STDOUT WITH CSV HEADER'));
  stream.pipe(export_csv);

  stream.on('end', done);
  stream.on('error', done);
});

pool.end();

var email_sender = fs.readFileSync('email_sender.txt', 'utf8');

//Node-Latex
const latex = require('node-latex')

const input = fs.createReadStream('certificate.tex')
const output = fs.createWriteStream('certificate.pdf')

const options = {
	inputs: __dirname
}

pdf = latex(input, options)
 
pdf.pipe(output)
pdf.on('error', err => console.error(err))



//Nodemailer
'use strict';

const nodemailer = require('nodemailer');

//var email_sender = fs.readFileSync('email_sender.txt', 'utf8');
//var email_recipient = fs.readFileSync('email_recipient.txt', 'utf8');

console.log(email_recipient.toString());

// Generate test SMTP service account from ethereal.email
// Only needed if you don't have a real mail account for testing
nodemailer.createTestAccount((err, account) => {
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: account.user, // generated ethereal user
            pass: account.pass // generated ethereal password
        }
    });

    // setup email data with unicode symbols
    let mailOptions = {
        from: 'admin@admin.com', // sender address - hardcoded for now
        to: 'employee@email.com', // list of receivers - hardcoded for now
        subject: 'Employee Recognition Award', // Subject line
        text: 'Here is your certificate', // plain text body
        html: '<b>Here is your certificate</b>', //html body
        attachments: [
            { 
                filename: 'certificate.pdf',
                path: __dirname + '/certificate.pdf'
            }
        ]
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        // Preview only available when sending through an Ethereal account
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    });
});
