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
exports.form = form
//Actualiza un formulario de typeform donde form es un
//objeto JSON con sus respectivos atributos
async function putForm(form, formId){
  options.json = form
  //send request
  request(options, (err, res) =>{
    if(err){console.log(err);}
    console.log(`Form ${formId} updated.`)
  })
  form = await getTypeformForm(formId)
  .catch((err) => {
    console.log(err)
  })
}

//Retorna un archivo, para el caso en el que se creo el metodo, la identificacion
//del item se hizo por su email.
exports.getFile = async function getFile(email){
    aux = options
    aux.url = `https://api.typeform.com/forms/${formId}/responses`
    aux.method = 'GET'
    request(aux, (error, response, body) => {
      console.log('error:', error); // Print the error if one occurred
      console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
      items =  body.items // Get Form Items
      items.map( (item) => {
        item.answers.map(ans => {
          if(ans.field.id === 'ZzXi9aX0aGaM' && ans.email === email){
            console.log(ans);
          }
          // if(ans.field.id === 'jFcKF2LevPtf' ){
            // console.log(ans);
          // }
        })
      })
  });
}

// returns a JSON Form
function getTypeformForm(formId){
  return new Promise((resolve, reject) => {
    request(`${options.url}`, (err, res) => {
      if (err){reject(err)}
      console.log(`Typeform ${formId} loaded succesfully.`);
      resolve(JSON.parse(res.body)) //response.body = formulario
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
  // console.log(form.fields);
  // console.log("----------------------------------");
  form.fields[fieldId].properties.choices = newChoices
}

exports.updateForm = async function(formId, values){
  form = await getTypeformForm(formId)
  .catch((err) => {
    console.log(err)
  })

  for(field in values){
    console.log(values[field].data);
    if(Array.isArray(values[field].data)){ //TODO: Actualizar cuando no es array
      updateDropdown(values[field].typeform_id ,values[field].data)
    }else{
      console.log("Data is not an array")
    }
  }
  putForm(form, formId)
}
