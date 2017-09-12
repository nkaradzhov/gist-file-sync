const fs = require('fs')
const { utf8, configname } = require('../constants')

const setConfig = (key, val, log) => {
  const exists = fs.existsSync(configname)
  let oldConfig = {}
  if (exists) {
    oldConfig = JSON.parse(fs.readFileSync(configname, utf8))
  }
  const newConfig = {
    ...oldConfig,
    ...{
      [key]: val
    }
  }
  fs.writeFileSync(configname, JSON.stringify(newConfig), utf8)
  log.succeed(`${key} is set`)
}

const setToken = (token, log) => setConfig('token', token, log)
const setGist = (gist, log) => setConfig('gist', gist, log)

module.exports = {
  setToken,
  setGist
}
