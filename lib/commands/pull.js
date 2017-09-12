const path = require('path')
const fs = require('fs')
const { fetchSpecialGist } = require('../utils');
const { utf8 } = require('../constants')

const pull = async (pathname, log) => {
  const filename = path.basename(pathname)
  log.start(`pulling ${pathname}`)
  const gist = await fetchSpecialGist()
  const file = gist.files[filename]
  if(file) {
    fs.writeFileSync(pathname, file.content, utf8)
    log.succeed(`pulled ${pathname}`)
  } else {
    log.fail(`couldn't find ${filename}`)
  }
  
}

module.exports = pull
