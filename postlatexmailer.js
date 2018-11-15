const pg = require('pg');
const copyTo = require('pg-copy-streams').to;
const fs = require('fs');

const exportCSV = fs.createWriteStream('namelist.csv');

const pool = new pg.Pool({
	user: 'lszxgtdwwniwwq',
	host: 'ec2-54-243-147-162.compute-1.amazonaws.com',
	database: 'dbi0l4fuki7pgh',
	password: '1d2225888a02606eb86d32787576c7db3dd4786b1fcf6508cb1fc27e7cef435e',
	port: '5432'
});

pool.connect(function(err, client, done) {
  var stream = client.query(copyTo('COPY awards TO STDOUT WITH CSV HEADER'));
  stream.pipe(exportCSV);
  //stream.pipe(process.stdout);
  stream.on('end', done);
  stream.on('error', done);
});

pool.end();


//Node-Latex
const latex = require('node-latex')
//const fs = require('fs')
 
const input = fs.createReadStream('certificate.tex')
const output = fs.createWriteStream('emp_month_award.pdf')

const options = {
	inputs: __dirname
}

pdf = latex(input, options)
 
pdf.pipe(output)
pdf.on('error', err => console.error(err))


//Nodemailer
'use strict';

const nodemailer = require('nodemailer');

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

    var emailAddress = "homer@doh.com";

    // setup email data with unicode symbols
    let mailOptions = {
        from: '"Jane Smith 👻" <admin@admin.com>', // sender address
        to: emailAddress, // list of receivers
        subject: 'Award', // Subject line
        text: 'Here is your certificate', // plain text body
        html: '<b>Here is your certificate</b>', //html body
        attachments: [
            { 
                filename: 'emp_month_award.pdf',
                path: __dirname + '/emp_month_award.pdf'
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
