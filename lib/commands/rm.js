const path = require('path')
const { fetchSpecialGist, updateSpecialGist } = require('../utils')

const rm = async (pathname, log) => {
  const filename = path.basename(pathname)
  log.start(`removing ${filename}`)
  
  const gist = await fetchSpecialGist(log)
  let description = {}
  try {
    description = JSON.parse(gist.description)
    delete description[filename]  
  } catch (e) {
  }
  
  const response = await updateSpecialGist({
    description: JSON.stringify(description),
    files: {
      [filename]: null
    }
  })
  log.succeed(`${filename} removed`)
}

module.exports = rm
