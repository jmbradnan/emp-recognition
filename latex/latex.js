const latex = require('node-latex')
const fs = require('fs')
 
const input = fs.createReadStream('input.tex')
const output = fs.createWriteStream('emp_month_cert.pdf')


const options = {
	inputs: "/home/ubuntu/ec2_01"
}

pdf = latex(input, options)
 
pdf.pipe(output)
pdf.on('error', err => console.error(err))