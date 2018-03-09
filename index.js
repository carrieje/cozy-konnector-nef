'use strict'
const {BaseKonnector} = require('cozy-konnector-libs')
const connection = require('./connection')
const bluebird = require('bluebird')

const baseUrl = `https://espace-client.lanef.com/templates/logon`
module.export = new BaseKonnector(start)

function start (fields) {
  return login(fields)
  .then(parseAccounts)
  .then(saveAccounts)
  .then(comptes =>
    bluebird.each(comptes, compte => {
      return fetchOperations(compte)
        .then(operations => saveOperations(compte, operations))
    })
  )
  .then(getDocuments)
}

function nop () {
  console.log('nop')
  return Promise.resolve([true])
}

const parseAccounts = nop
const saveAccounts = nop
const fetchOperations = nop
const saveOperations = nop
const getDocuments = nop

function validateLogin (statusCode, $, json) {
  return $('#welcomebar').length === 1
}

function login (fields) {
  const page = 'logon.cfm'
  const population = {
    'USERID': fields.login,
    'STATIC': fields.password
  }
  return connection.init(baseUrl, page, '#formSignon', population, validateLogin)
}
