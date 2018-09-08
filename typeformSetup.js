const request = require('request')
const querystring = require('querystring')
const url = require('url').Url
const http = require('https')
const fs = require('fs')
const config = JSON.parse(fs.readFileSync('./config.json'))

const formId = config.typeform.formId // ID del formulario en typeform
const options = {  //Opciones de configuracion para el formulario
    url: `https://api.typeform.com/forms/${formId}`,
    method: 'PUT',
    headers: {
        'Accept': 'application/json',
        'Accept-Charset': 'utf-8',
        'Authorization': `Bearer ${config.typeform.accessToken}`
    },
    json: {}
};

let form = getTypeformForm(formId)
//Actualiza un formulario de typeform donde form es un objeto JSON con sus respectivos atributos
async function putForm(form, formId){
  options.json = form

  //send request
  function callback(error, response, body) {
    if (!error) {
        var info = JSON.parse(JSON.stringify(body));
        // console.log(info);
    }
    else {
      console.log(error);
    }
  }
  //send request
  console.log("Sending new form.");
  request(options, callback)
  form = await getTypeformForm(formId)
  console.log(form);
}

// returns a JSON Form
function getTypeformForm(formId){
  return new Promise((resolve, reject) => {
    request(`${options.url}`, (err, res) => {
      if (err){reject(err)}
      console.log("Typeform form loaded succesfully.");
      resolve(JSON.parse(res.body))
    })
  })
}

function updateDropdown(fieldId, data){
  let newChoices = []
  for (let i = 0; i < data.length; i++) {
    let choice = { label: 'text' }
    choice.label = data[i]
    newChoices.push(choice)
  }
  form.fields[fieldId].properties.choices = newChoices
}

exports.updateForm = async function(formId, values){
  form = await getTypeformForm(formId)
  for(field in values){
    console.log(values[field].data);
    if(Array.isArray(values[field].data)){
      updateDropdown(values[field].typeform_id ,values[field].data)
    }else{
      console.log("Data is not an array")
    }
  }
  putForm(form, formId)
}
