const path = require('path')
const { updateSpecialGist } = require('../utils')

const rm = async (pathname, log) => {
  const filename = path.basename(pathname)
  log.start(`removing ${filename}`)
  const response = await updateSpecialGist({
    files: {
      [filename]: null
    }
  })
  log.succeed(`${filename} removed`)
}

module.exports = rm
