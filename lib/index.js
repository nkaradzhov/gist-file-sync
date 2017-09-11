const argv = require('minimist')(process.argv.slice(2))
const fs = require('fs')
const moment = require('moment')
const path = require('path')

const {
  pull,
  push,
  ls,
  rm,
  sync,
  setToken,
  setGist
} = require('./commands');

const execute = () => {
  const pathname = argv._[0]

  if (argv.token) 
    return setToken(argv.token)

  if (argv.gist) 
    return setGist(argv.gist)

  if (argv.pull) 
    return pull(pathname)

  if (argv.push) 
    return push(pathname)

  if (argv.r) 
    return rm(pathname)

  if (argv.l) 
    return ls()

  if (pathname) 
    return sync(pathname)
}

execute()
