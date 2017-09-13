const path = require('path')
const fs = require('fs')
const { updateSpecialGist, fetchSpecialGist, getDescription } = require('../utils')
const { utf8 } = require('../constants')

const push = async (pathname, log) => {
  const filename = path.basename(pathname)
  log.start(`pushing ${filename}`)
  let content
  try {
    content = fs.readFileSync(pathname, utf8)
  } catch (e) {
    log.fail(`no such file ${pathname}`)
    return
  }
  
  const gist = await fetchSpecialGist()
  const remoteFile = gist.files[filename]
  if(remoteFile && remoteFile.content === content) {
    log.info(`files are identical`)
    return
  }
  
  const description = getDescription(gist)
  const newDescription = {
    ...description,
    [filename]: Date.now()
  }
  const response = await updateSpecialGist({
    description: JSON.stringify(newDescription),
    files: {
      [filename]: {
        content
      }
    }
  })
  log.succeed(`${filename} pushed`)
}

module.exports = push
