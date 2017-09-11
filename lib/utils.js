const fs = require('fs')
const fetch = require('node-fetch')
const { utf8, configname, baseUrl } = require('./constants')

const fetchJson = (...args) => fetch(...args).then(r => r.json())

const getConfig = key => JSON.parse(fs.readFileSync(configname, utf8))

const authenticated = token => ({
  headers: { Authorization: `token ${token}` }
})

const specialGistUrl = gistId => baseUrl + `gists/${gistId}`

const fetchGist = async gistUrl => {
  const { token } = getConfig()
  return fetchJson(gistUrl, authenticated(token))
}

const fetchSpecialGist = () => {
  const { gist } = getConfig()
  return fetchGist(specialGistUrl(gist))
}

const updateSpecialGist = files => {
  const { gist, token } = getConfig()
  return fetchJson(specialGistUrl(gist), {
    ...authenticated(token),
    method: 'PATCH',
    body: JSON.stringify(files)
  })
}

module.exports = {
  fetchGist,
  fetchSpecialGist,
  updateSpecialGist
};
