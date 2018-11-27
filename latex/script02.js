const fs = require('fs');
const imageDataURI = require('image-data-uri');
const latex = require('node-latex');
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const base64 = require('file-base64');

//create electronic signature image file - decode from data URI
var dataURI = '';
fs.readFile(__dirname + '/e_sig.txt', 'utf8', function read(err, data) {
	if (err) {
		throw err;
	}
	dataURI = data;
	
	let filePath = __dirname + '/eSig.png';
	imageDataURI.outputFile(dataURI, filePath);
})

//create LaTex certicate
//Node-Latex 
const input = fs.createReadStream(__dirname + '/certificate.tex'); //read in certificate template in laTex
const output = fs.createWriteStream(__dirname + '/certificate.pdf'); //write certificate to pdf file

const options = {
	inputs: __dirname
};

pdf = latex(input, options); //run pdflatex 
 
pdf.pipe(output);
pdf.on('error', err => console.error(err));

//read in email addresses from files
var email_sender = '';
var email_recipient = '';

fs.readFile(__dirname + '/email_sender.txt', 'utf8', function read(err, data) {
  if (err) {
    throw err;
  }
  email_sender = data;
})

fs.readFile(__dirname + '/email_recipient.txt', 'utf8', function read(err, data) {
  if (err) {
    throw err;
  }
  email_recipient = data;
})

//prepare email attachment- encode file to base64 string
//send email via SendGrid
base64.encode('certificate.pdf', function(err, base64String) {
  const msg = {
    to: email_recipient,
    from: email_sender,
    subject: 'Employee Recognition Award',
    html: '<p>Here’s your certificate!</p>',
    attachments: [
      {
        content: base64String,
        filename: 'certificate.pdf'
      }
    ]
  };
  sgMail.send(msg);
});
