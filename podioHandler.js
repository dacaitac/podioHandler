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
      if (err) reject(error)

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

//No funciona
exports.updateItem = async function updateItem( itemId, data ){
  await requestPass('PUT', `/item/${itemId}/value/`, data)
  .then( response => console.log( response ) )
  .catch( error =>  console.log(error) )
}

//No funciona
exports.newItem = function newItem(appId, data){
  requestPass('POST', `/item/app/${appId}/`, data)
  .then( responseData => {
    console.log(responseData)
  })
  .catch( error => {
    console.log(error)
  })
}

//Ejecuta una accion sobre todos los items de una aplicacion
exports.toAllItems = function toAllItems ( appId ) {
  return new Promise ((resolve, reject) => {
    request('GET', `/item/app/${appId}/`, null)
    .then( response => {
      let itemList = response.items
      itemList.map( item => resolve(item.item_id) )
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

function getHooks( itemId, fieldId ){
  requestPass( 'PUT', ` /item/${ itemId }/value/${ fieldId }`, data )
    .then( response  => console.log( response ))
    .catch( err => console.log( err ) )
}

function validateHook( hookId ){
  request( 'POST', `/hook/${ hookId }/verify/validate`, {"code": "code"} )
    .then( response => console.log( response ) )
    .catch( err => console.log( err ) )
}
