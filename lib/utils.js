const fs = require('fs')
const fetch = require('node-fetch')
const { utf8, configname, baseUrl } = require('./constants')

const fetchJson = (...args) => fetch(...args).then(r => r.json())

const getConfig = log => {
  try {
    return JSON.parse(fs.readFileSync(configname, utf8))
  } catch (e) {
    log.fail(`Could not read config file - ${configname}`)
    process.exit()
  }
}

const authenticated = token => ({
  headers: { Authorization: `token ${token}` }
})

const specialGistUrl = gistId => baseUrl + `gists/${gistId}`

const fetchSpecialGist = log => {
  const { gist } = getConfig(log)
  const { token } = getConfig(log)
  return fetchJson(specialGistUrl(gist), authenticated(token))
}

const updateSpecialGist = (files, log) => {
  const { gist, token } = getConfig(log)
  return fetchJson(specialGistUrl(gist), {
    ...authenticated(token),
    method: 'PATCH',
    body: JSON.stringify(files)
  })
}

const getDescription = (gist, log) => {
  try {
    return JSON.parse(gist.description)
  } catch (e) {
    log.fail(`Could not parse gist description: ${gist.description}`)
    process.exit()
  }
}

module.exports = {
  fetchSpecialGist,
  updateSpecialGist,
  getDescription
}
