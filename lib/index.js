const program = require('commander')
const fetch = require('node-fetch')
const {promisify} = require('util')
const fs = require('fs')
const moment = require('moment')
const path = require('path')

const fetchJson = (...args) => fetch(...args).then(r => r.json())

const utf8 = 'utf8'
const configname = 
  path.join(
    process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'],
    '.gist-file-sync'
  )
  
const getConfig = key => JSON.parse(
  fs.readFileSync(configname, utf8)
)[key]


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

const rm = async fileName => {
  const response = await fetchJson(specialGistUrl, {
    ...authenticated,
    method: 'PATCH',
    body: JSON.stringify({
      files: {
        [fileName]: null
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
  const newConfig = { ...oldConfig, ...{ [key]: val }}
  fs.writeFileSync(configname, JSON.stringify(newConfig), utf8)
  console.log('done');
}

const setToken = token => setConfig('token', token)
const setGist = gist => setConfig('gist', gist)

program.version('0.1.0')

program.command('[name]').description('Automatic sync').action(sync)

program.command('pull [name]').description('Pull file from the gist').action(pull)

program.command('push [name]').description('Push file to the gist').action(push)

program.command('rm [name]').description('Remove file from the gist').action(rm)

program.command('ls').description('List all files in the gist').action(ls)

program.command('token [token]').description('Set a Personal access token -> see https://github.com/settings/tokens').action(setToken)

program.command('gist [gist]').description('Set a gist id to use -> see https://gist.github.com/').action(setGist)


program.parse(process.argv)

if (program.args.length) {
  sync(...program.args)
} else {
  program.outputHelp()
  console.log('\n')
}
