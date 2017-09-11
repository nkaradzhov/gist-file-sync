const path = require('path')
const fs = require('fs')
const { updateSpecialGist } = require('../utils')
const { utf8 } = require('../constants')

const push = async pathname => {
  const filename = path.basename(pathname)
  const content = fs.readFileSync(pathname, utf8)
  const response = await updateSpecialGist({
    files: {
      [filename]: {
        content
      }
    }
  })
  console.log('done')
}

module.exports = push
