const argv = require('minimist')(process.argv.slice(2))
const fs = require('fs')
const moment = require('moment')
const path = require('path')
const log = require('ora')()

const {
  pull,
  push,
  ls,
  rm,
  sync,
  setToken,
  setGist,
  help,
  test
} = require('./commands');

const execute = async () => {
  const pathname = argv._[0]

  if (argv.token) 
    return setToken(argv.token, log)

  if (argv.gist) 
    return setGist(argv.gist, log)

  if (argv.pull) 
    return pull(pathname, log)

  if (argv.push) 
    return push(pathname, log)

  if (argv.r) 
    return rm(pathname, log)

  if (argv.l) 
    return ls(log)

  if (pathname) 
    return sync(pathname, log)
  else
    return help()
}

execute()
