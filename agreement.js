var fs = require('fs');
var pdf = require('dynamic-html-pdf');
var html = fs.readFileSync('./src/acuerdo.html', 'utf8');
var nodemailer = require('nodemailer');
const config = JSON.parse(fs.readFileSync('./config.json'))

var options = {
    format: "A3",
    orientation: "portrait",
    border: "50mm",
    border: {
      "top": "30mm",            // default is 0, units: mm, cm, in, px
      "right": "20mm",
      "bottom": "20mm",
      "left": "30mm"
    },
};

async function createAg( json ){
  let str = json.linkOp
  let arr = str.split("/")
  let code = arr[arr.length - 1]
  let filename = `Acuerdo ${json.nombre}.pdf`

  let date = new Date()
  var document = {
      template: html,
      context: {
          options: {
              dia: date.getDate(),
              mes: date.getMonth(),
              anio: date.getYear(),
              nombre: json.nombre,
              pasaporte: json.pasaporte,
              pais: json.pais,
              empresa: json.empresa,
              opcode: code
          },
      },
      path: `./${filename}`
  }

  await pdf.create(document, options)
      .then(res => {
          console.log(res)
      })
      .catch(error => {
          console.error(error)
      });

  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.gmail.user,
      pass: config.gmail.password
    }
  })

  var mailOptions = {
    from: config.gmail.user,
    to: json.correo,
    subject: 'Proceso de Legalización',
    text: 'That was easy!',
    attachments: [{filename:`${filename}`, path: `./${filename}`}]
  }

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  })
}

let query = {
    nombre: 'NOMBRE',
    pasaporte: 'PASAPORTE',
    pais: 'PAIS',
    empresa: 'EMPRESA',
    linkOp: 'https://expa.aiesec.org/opportunities/1047227',
    correo: 'i7.danielcc@gmail.com'
}

createAg( query )
