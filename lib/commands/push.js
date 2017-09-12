const path = require('path')
const fs = require('fs')
const { updateSpecialGist } = require('../utils')
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
  const response = await updateSpecialGist({
    files: {
      [filename]: {
        content
      }
    }
  })
  log.succeed(`${filename} pushed`)
}

module.exports = push
