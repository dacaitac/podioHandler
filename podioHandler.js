'use strict'

const PodioJS   = require('podio-js').api
const fs        = require('fs')
const jsonpatch = require('json-patch')
let   config    = JSON.parse(fs.readFileSync('./config.json'))

// get the API id/secret
let clientId      = config.podio.clientId
let clientSecret  = config.podio.clientSecret

// get the app ID and Token for appAuthentication
let appId     = config.podio.appId
let appToken  = config.podio.appToken

// SDK de Podio con autenticacion por App
const podio = new PodioJS({
  authType    : 'app',
  clientId    : clientId,
  clientSecret: clientSecret
})

// Simplifica los request que utilizan autenticacion por App
// method: HTTP method
// podioRequest: Podio API
// Devuelve una promesa con el response de Podio
function request (method, podioRequest, data) {
  return new Promise((resolve, reject) => {
    data = data || null
    podio.authenticateWithApp(appId, appToken, (err) => {
      if (err) reject(err)

      podio.isAuthenticated()
        .then(() => { // Ready to make API calls in here...
          podio.request(method, podioRequest, data)
            .then(response => {
              console.log('Podio request Complete')
              resolve(response)
            })
            .catch(err => console.log(err))
        })
        .catch(err => console.log(err))
    })
  })
}

// Hay algunos endpoints que no permiten la autenticacion por app
// en este bloque se hace una autenticacion secundaria por usuario y contraseña

var podio2 = new PodioJS({
  authType    : 'password',
  clientId    : clientId,
  clientSecret: clientSecret
})
var username = config.podio.user.username
var password = config.podio.user.password

function requestPass (method, podioRequest, data) {
  return podio2.isAuthenticated().then(function() {
  // Ready to make API calls...
  }).catch(function(err) {
    podio2.authenticateWithCredentials( username, password, function() {
      // Make API calls here...
      podio2.request( method, podioRequest, data )
        .then( response => {
          console.log('Podio request Complete')
          // console.log(response)
        })
        .catch(err => console.log( err ) )
    })
  })
}

// Llama todos los atributos de un campo en Podio
// Para los solos valores es mejor usar la funcion getFieldValues
exports.getField = function getField( appId, fieldId ){
  return new Promise ( (resolve, reject) => {
    request( 'GET', `/app/${ appId }/field/${ fieldId }`, null )
    .then( response => { resolve( response ) })
    .catch(err => {
      reject(err)
      console.log(err)
    })
  })
}

exports.getItem = function getItem ( itemId ) {
  console.log("Calling Item from Podio")
  return new Promise ((resolve, reject) => {
    request('GET', `/item/${itemId}`, null)
    .then( ( response ) => {
      resolve( response )
    })
    .catch(err => {
      reject(err)
      console.log(err)
    })
  })
}

exports.updateField = async function updateField( appId, fieldId, data ){
  await requestPass('PUT', `/app/${appId}/field/${fieldId}`, data)
  .then( response => console.log( response ) )
  .catch( error =>  console.log( error ) )
}

exports.updateItem = async function updateItem( itemId, data ){
  await requestPass('PUT', `/item/${itemId}/value/`, data)
  .then( response => console.log( response ) )
  .catch( error =>  console.log(error) )
}

exports.newItem = function newItem(appId, data){
  requestPass('POST', `/item/app/${appId}/`, data)
  .then( responseData => {
    console.log(responseData)
  })
  .catch( error => {
    console.log(error)
  })
}

exports.getAllItems = function getAllItems ( appId ) {
  if (appId == 14636882){
    config.podio.appToken = "0980ba976500450cacfcef31848883e3"
    config.podio.appId = 14636882
  }

  if (appId == 21460631){
    config.podio.appToken = "ac254c52522c4e599e723312074005e8"
    config.podio.appId = 21460631
  }

  if (appId == 21471912){
    config.podio.appToken = "b61f7b326b874748b40858f47211374b"
    config.podio.appId = 21471912
  }

  return new Promise ((resolve, reject) => {
    request('GET', `/item/app/${appId}/`, {"limit": 100})
    .then( response => {
      console.log(response);
      let itemList = response.items
      resolve(itemList)
    })
    .catch( err => console.log( err ) )
  })
}

//Devuelve un objeto JSON con los valores del item seleccionado
exports.getItemValues = function getItemValues( itemId ) {
  return new Promise (( resolve, reject ) => {
    request( 'GET', `/item/${ itemId }/value/v2`, null )
      .then( response => resolve( response ) )
      .catch( err => {
        reject( err )
        console.log( err )
      })
  })
}

exports.getCategoryField = function getCategoryField(appId, fieldId){
  return new Promise((resolve, reject) => {
    request('GET', `/app/${appId}/field/${fieldId}`)
      .then((response) =>{
        let list = []
        let options = response.config.settings.options;
        options = options.filter(option => option.status == 'active')
        // console.log(options);
        options.map((option) => {
          list.push(option.text)
        })
        resolve(list)
      })
      .catch(err => reject(err))
  })
}
