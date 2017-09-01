const program = require('commander')
const fetch = require('node-fetch')
const {promisify} = require('util')
const fs = require('fs')
const moment = require('moment')

const writeFile = promisify(fs.writeFile)
const readFile = promisify(fs.readFile)
const fileExists = promisify(fs.exists)
const stat = promisify(fs.stat)

const fetchJson = (...args) => fetch(...args).then(r => r.json())

const utf8 = 'utf8'

const token = fs.readFileSync('token', utf8).trim()
const authenticated = {
  headers: {
    Authorization: `token ${token}`
  }
}

const baseUrl = 'https://api.github.com/'
const gistId = fs.readFileSync('gist', utf8).trim()
const specialGistUrl = baseUrl + `gists/${gistId}`

const pull = async fileName => {
  const gist = await fetchJson(specialGistUrl, authenticated)
  const file = gist.files[fileName]
  await writeFile(file.filename, file.content, utf8)
  console.log('done')
}

const push = async fileName => {
  const content = await readFile(fileName, utf8)
  const response = await fetchJson(specialGistUrl, {
    ...authenticated,
    method: 'PATCH',
    body: JSON.stringify({
      files: {
        [fileName]: {
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
    const stats = await stat(fileName)
    return {
      mtime: stats.mtime,
      content: await readFile(fileName, utf8)
    }
  } catch (e) {
    return null
  }
}

const getRemoteFile = async fileName => {
  const gist = await fetchJson(specialGistUrl, authenticated)
  const rFile = gist.files[fileName]
  if (!rFile) {
    return null
  } else {
    let currentGist = gist
    for (let h of gist.history) {
      const oldGist = await fetchJson(h.url, authenticated)
      const oldFile = oldGist.files[fileName]
      const currentFile = currentGist.files[fileName]
      if (!oldFile || currentFile.content !== oldFile.content) {
        return {content: rFile.content, mtime: currentGist.updated_at}
      }
      currentGist = oldGist
    }
    return null
  }
}

const sync = async fileName => {
  const local = await getLocalFile(fileName)
  
  if (!local) {
    console.log('no local file, try to pull')
    return pull(fileName)
  }

  const remote = await getRemoteFile(fileName)
  
  if (!remote) {
    console.log('no remote file, try to push')
    return push(fileName)
  }

  if (moment(local.mtime).isAfter(moment(remote.mtime))) {
    console.log('local file is newer, so push it')
    return push(fileName)
  } else {
    console.log('remote file is newer, so pull it')
    return pull(fileName)
  }

}

const setToken = async token => {
  await writeFile('token', token)
  console.log('done');
}

const setGist = async gist => {
  await writeFile('gist', gist)
  console.log('done');
}

program.version('0.1.0')

program.command('s [name]').description('Automatic sync').action(sync)

program.command('pull [name]').description('Pull file from the gist').action(pull)

program.command('push [name]').description('Push file to the gist').action(push)

program.command('rm [name]').description('Remove file from the gist').action(rm)

program.command('ls').description('List all files in the gist').action(ls)

program.command('token [token]').description('Set a Personal access token -> see https://github.com/settings/tokens').action(setToken)

program.command('gist [gist]').description('Set a gist id to use -> see https://gist.github.com/').action(setGist)


program.parse(process.argv)

if (!process.argv.slice(2).length) {
  program.outputHelp()
  console.log('\n')
}
