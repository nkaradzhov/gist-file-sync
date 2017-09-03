const argv = require('minimist')(process.argv.slice(2))
const fetch = require('node-fetch')
const {promisify} = require('util')
const fs = require('fs')
const moment = require('moment')
const path = require('path')

const fetchJson = (...args) => fetch(...args).then(r => r.json())

const utf8 = 'utf8'
const configname = path.join(process.env[(process.platform === 'win32')
    ? 'USERPROFILE'
    : 'HOME'], '.gist-file-sync')

const getConfig = key => JSON.parse(fs.readFileSync(configname, utf8))[key]

const token = getConfig('token')
const authenticated = {
  headers: {
    Authorization: `token ${token}`
  }
}

const baseUrl = 'https://api.github.com/'
const gistId = getConfig('gist')
const specialGistUrl = baseUrl + `gists/${gistId}`

const pull = async pathname => {
  const filename = path.basename(pathname)
  const gist = await fetchJson(specialGistUrl, authenticated)
  const file = gist.files[filename]
  fs.writeFileSync(pathname, file.content, utf8)
  console.log('done')
}

const push = async pathname => {
  const filename = path.basename(pathname)
  const content = fs.readFileSync(pathname, utf8)
  const response = await fetchJson(specialGistUrl, {
    ...authenticated,
    method: 'PATCH',
    body: JSON.stringify({
      files: {
        [filename]: {
          content
        }
      }
    })
  })
  console.log('done')
}

const ls = async() => {
  const gist = await fetchJson(specialGistUrl, authenticated)
  console.log(Object.keys(gist.files).join('\n'))
}

const rm = async pathname => {
  const filename = path.basename(pathname)
  const response = await fetchJson(specialGistUrl, {
    ...authenticated,
    method: 'PATCH',
    body: JSON.stringify({
      files: {
        [filename]: null
      }
    })
  })
  console.log('done')
}

const getLocalFile = async fileName => {
  try {
    const stats = fs.statSync(fileName)
    return {
      mtime: stats.mtime,
      content: fs.readFileSync(fileName, utf8)
    }
  } catch (e) {
    return null
  }
}

const getRemoteFile = async filename => {
  const gist = await fetchJson(specialGistUrl, authenticated)
  const rFile = gist.files[filename]
  if (!rFile) {
    return null
  } else {
    let currentGist = gist
    for (let h of gist.history) {
      const oldGist = await fetchJson(h.url, authenticated)
      const oldFile = oldGist.files[filename]
      const currentFile = currentGist.files[filename]
      if (!oldFile || currentFile.content !== oldFile.content) {
        return {content: rFile.content, mtime: currentGist.updated_at}
      }
      currentGist = oldGist
    }
    return null
  }
}

const sync = async pathname => {
  const local = await getLocalFile(pathname)

  if (!local) {
    console.log('no local file, try to pull')
    return pull(pathname)
  }
  const filename = path.basename(pathname)
  const remote = await getRemoteFile(filename)

  if (!remote) {
    console.log('no remote file, try to push')
    return push(pathname)
  }

  if (moment(local.mtime).isAfter(moment(remote.mtime))) {
    console.log('local file is newer, so push it')
    return push(pathname)
  } else {
    console.log('remote file is newer, so pull it')
    return pull(pathname)
  }

}

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
