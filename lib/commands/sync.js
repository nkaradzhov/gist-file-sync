const fs = require('fs')
const path = require('path')
const { utf8 } = require('../constants')
const { fetchGist, fetchSpecialGist } = require('../utils')
const moment = require('moment')
const push = require('./push')
const pull = require('./pull')

const getLocalFile = async pathname => {
  try {
    const stats = fs.statSync(pathname)
    return {
      mtime: stats.mtime,
      content: fs.readFileSync(pathname, utf8)
    }
  } catch (e) {
    return null
  }
}

const getRemoteFile = async (filename, log) => {
  log.start(`searching for ${filename}`)
  const gist = await fetchSpecialGist()
  const rFile = gist.files[filename]
  if (!rFile) {
    return null
  } else {
    return {
      content: rFile.content,
      mtime: JSON.parse(gist.description)[filename]
    }
    // let currentGist = gist
    // for (let h of gist.history) {
    //   const oldGist = await fetchGist(h.url)
    //   const oldFile = oldGist.files[filename]
    //   const currentFile = currentGist.files[filename]
    //   if (!oldFile || currentFile.content !== oldFile.content) {
    //     return {content: rFile.content, mtime: currentGist.updated_at}
    //   }
    //   currentGist = oldGist
    // }
    // return null
  }
}

const sync = async (pathname, log) => {
  const local = await getLocalFile(pathname)

  if (!local) {
    log.info(`no local file ${pathname}`)
    return pull(pathname, log)
  }
  const filename = path.basename(pathname)
  const remote = await getRemoteFile(filename, log)

  if (!remote) {
    log.info(`no remote file ${filename}`)
    return push(pathname, log)
  }

  if (moment(local.mtime).isAfter(moment(remote.mtime))) {
    // log.info(`local file is newer`)
    return push(pathname, log)
  } else {
    // log.info(`remote file is newer`)
    return pull(pathname, log)
  }

}

module.exports = sync
