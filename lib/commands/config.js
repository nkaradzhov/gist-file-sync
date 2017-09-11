const fs = require('fs')
const { utf8, configname } = require('../constants')

const setConfig = (key, val) => {
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
  console.log('done');
}

const setToken = token => setConfig('token', token)
const setGist = gist => setConfig('gist', gist)

module.exports = {
  setToken,
  setGist
}
