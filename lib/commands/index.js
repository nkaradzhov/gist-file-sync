const configCommands = require('./config')

module.exports = {
  pull: require('./pull'),
  push: require('./push'),
  ls: require('./ls'),
  rm: require('./rm'),
  sync: require('./sync'),
  setToken: configCommands.setToken,
  setGist: configCommands.setGist
}
