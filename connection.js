'use strict'
const {errors, log, requestFactory} = require('cozy-konnector-libs')
const cheerio = require('cheerio')

module.exports.init = function (
  baseUrl,
  page,
  formSelector,
  population,
  validate = defaultValidate,
  parseStrategy = 'raw',
  opts = {}) {

  const defaultOpts = { jar: true, cheerio: true, json: false }

  const rq = requestFactory({
    ...opts,
    ...defaultOpts
  })

  const parseBody = defineStrategy(parseStrategy)

  return rq(`${baseUrl}/${page}`)
  .then($ => {
    const [action, inputs] = parseForm($, formSelector)
    for (let name in population) {
      inputs[name] = population[name]
    }

    return submitForm(rq, `${baseUrl}/${action}`, inputs, parseBody)
  })
  .then(([statusCode, parsedBody]) => {
    if (!validate(statusCode, parsedBody)) {
      throw new Error(errors.LOGIN_FAILED)
    } else {
      return Promise.resolve(parsedBody)
    }
  })
}

function defaultValidate (statusCode, body) {
  return statusCode === 200
}

function defineStrategy (parseStrategy) {
  switch (parseStrategy) {
    case 'cheerio':
      return cheerio.load
    case 'json':
      return JSON.parse
    default:
      let err = `connection: parsing strategy ${parseStrategy} unknown. `
      let fallback = 'Falling back to `raw`. Use one of `raw`, `cheerio` or `json`'
      log('warn', err + fallback)
    case 'raw':
      return (body) => body
  }
}

function parseForm ($, formSelector) {
  const action = $(formSelector).attr('action')
  const inputs = {}
  const arr = $(formSelector).serializeArray()
  for (let input of arr) {
    inputs[input.name] = input.value
  }
  return [action, inputs]
}

function submitForm (rq, uri, inputs, parseBody) {
  return rq({
    uri: uri,
    method: 'POST',
    form: {
      ...inputs
    },
    transform: (body, response) => [response.statusCode, parseBody(body)]
  })
}
