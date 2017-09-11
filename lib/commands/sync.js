const fs = require('fs')
const path = require('path')
const { utf8 } = require('../constants')
const { fetchGist, fetchSpecialGist } = require('../utils')
const moment = require('moment')
const push = require('./push')
const pull = require('./pull')

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
  const gist = await fetchSpecialGist()
  const rFile = gist.files[filename]
  if (!rFile) {
    return null
  } else {
    let currentGist = gist
    for (let h of gist.history) {
      const oldGist = await fetchGist(h.url)
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

module.exports = sync
