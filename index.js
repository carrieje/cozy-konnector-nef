'use strict'
const {BaseKonnector} = require('cozy-konnector-libs')
const bluebird = require('bluebird')

module.export = new BaseKonnector(start)

function start (fields) {
  return login()
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

const login = nop
const parseAccounts = nop
const saveAccounts = nop
const fetchOperations = nop
const saveOperations = nop
const getDocuments = nop
