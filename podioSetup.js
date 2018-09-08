'use strict'

const PodioJS = require('podio-js').api
const fs = require('fs')
const config = JSON.parse(fs.readFileSync('./config.json'))
const jsonpatch = require('json-patch')

// Just for testing
const itemId = 926659089

// get the API id/secret
const clientId = config.podio.clientId
const clientSecret = config.podio.clientSecret

// get the app ID and Token for appAuthentication
const appId = config.podio.appId
const appToken = config.podio.appToken

// instantiate the SDK
const podio = new PodioJS({
  authType: 'server',
  clientId: clientId,
  clientSecret: clientSecret
}, {
  apiURL: config.podio.apiURL,
  enablePushService: true
})

// Simplifica los request a Podio
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

// Este ojeto se define para cada instancia del programa
// function podioObject (itemId) {
//
//   getItem(itemId)
//   .then(response  => console.log(response.fields))
//   .catch(err => console.log(err))
//
//   // return {
//   //   itemId: response.item_id,
//   //   name: response.fields[0].values[0].value,
//   //   email: response.fields[1].values[0].value,
//   //   idNumber: response.fields[2].values[0].value,
//   //   addressed: response.fields[3].values[0].value
//   // }
// }

//Ejecuta una accion sobre todos los items de una aplicacion
//y retorna una lista con los items actualizados
function toAllItems (appId) {
  return new Promise ((resolve, reject) => {
    request('GET', `/item/app/${appId}/`, null)
    .then((response) => {
      let itemList = response.items
      itemList.map(function (item) {
        item = podioObject(item)
        toItem(item.itemId)
      })
      resolve(itemList)
    })
    .catch(err => console.log(err))
  })
}

//Ejecuta una accion sobre un solo item
function toItem (itemId) {
  request('GET', `/item/${itemId}`, null)
    .then((response) => {
      console.log(response);
    })
    .catch(err => console.log(err))
}
//
// function getItem (itemId) {
//   return new Promise((resolve, reject) => {
//     request('GET', `/item/${itemId}`, null)
//     .then((response) => {
//       resolve(response)
//     })
//   })
// }
// itemAction(899099523)
// getItem(itemId)
exports.getCategoryField = function getCategoryField(fieldId){
  return new Promise((resolve, reject) => {
    request('GET', `/app/${appId}/field/${fieldId}`)
      .then((response) =>{
        let list = []
        let options = response.config.settings.options;
        options.map((option) => {
          list.push(option.text)
        })
        resolve(list)
      })
      .catch(err => reject(err))
  })
}

// getCategoryFields(176422604)
