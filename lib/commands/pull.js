const path = require('path')
const fs = require('fs')
const { fetchSpecialGist } = require('../utils');
const { utf8 } = require('../constants')

const pull = async pathname => {
  const filename = path.basename(pathname)
  const gist = await fetchSpecialGist()
  const file = gist.files[filename]
  fs.writeFileSync(pathname, file.content, utf8)
  console.log('done')
}

module.exports = pull
