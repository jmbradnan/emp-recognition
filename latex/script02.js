//read electronic signature data URI from file and convert to image file
const fs = require('fs');
const imageDataURI = require('image-data-uri');

var dataURI = '';
fs.readFile(__dirname + '/e_sig.txt', 'utf8', function read(err, data) {
	if (err) {
		throw err;
	}
	dataURI = data;
	
	let filePath = __dirname + '/eSig.png';
	imageDataURI.outputFile(dataURI, filePath);
})



//Node-Latex 
const latex = require('node-latex');

const input = fs.createReadStream(__dirname + '/certificate.tex'); //read in certificate template in laTex
const output = fs.createWriteStream(__dirname + '/certificate.pdf'); //write certificate to pdf file

const options = {
	inputs: __dirname
};

const pdf = latex(input, options); //run pdflatex 
 
pdf.pipe(output);
pdf.on('error', err => console.error(err));

//setup for Nodemailer
//get email addresses from files 
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

    // setup email data with unicode symbols
    let mailOptions = {
        from: email_sender, // sender address 
        to: email_recipient, // list of receivers
        subject: 'Employee Recognition Award', // Subject line
        text: "Congratulations! In honor of your achievement, we would like to present this certificate for you.  Thank you for your contributions.", // plain text body
        html: '<b>Congratulations! In honor of your achievement, we would like to present this certificate for you.  Thank you for your contributions.</b>', //html body
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
        
        // save preview URL to file
        var messageInfo = nodemailer.getTestMessageUrl(info);
        const fs = require('fs');
        fs.writeFile(__dirname + "/preview_URL.txt", messageInfo, function(err) {
            if(err) {
                return console.log(err);
            }
        });     
    });
});