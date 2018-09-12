const typeform = require('./typeformSetup')
const podio = require('./podioSetup')

const formId = 'LFqikz' // ID del formulario en typeform
let values = {
  'COMPANY_NAME': {
    'typeform_id': 2,
    'podio_id' : 176573088,
    'data': []
  },
  'OPPORTUNITIES': {
    'typeform_id': 3,
    'podio_id' : 176573087,
    'data': []
  },
  'COPERATIONS': {
    'typeform_id': 5,
    'podio_id' : 176573089,
    'data': []
  }
}

function resetValues(values){
  for(field in values)
    values[field].data = []
}


async function setValues(values){
  resetValues(values)
  for(field in values){
    values[field].data = await podio.getCategoryField(values[field].podio_id)
  }
  typeform.updateForm(formId, values)
}

// var express = require("express"),
//     app = express(),
//     bodyParser  = require("body-parser"),
//     methodOverride = require("method-override");
//     mongoose = require('mongoose');
//
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());
// app.use(methodOverride());
//
// var router = express.Router();
//
// app.get('/', (req, res) => {
//   setValues(values)
//   res.status(200).send('Hello, world!');
// });
// // [END hello_world]
//
// if (module === require.main) {
//   // [START server]
//   // Start the server
//   const server = app.listen(process.env.PORT || 8080, () => {
//     const port = server.address().port;
//     console.log(`App listening on port ${port}`);
//   });
//   // [END server]
// }
//
// module.exports = app;
setValues(values)
