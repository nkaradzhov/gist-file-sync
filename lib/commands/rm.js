const path = require('path')
const { updateSpecialGist } = require('../utils')

const rm = async pathname => {
  const filename = path.basename(pathname)
  const response = await updateSpecialGist({
    files: {
      [filename]: null
    }
  })
  console.log('done')
}

module.exports = rm
