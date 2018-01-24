const { fetchSpecialGist } = require('../utils')

const ls = async log => {
  log.start('loading remote gist')
  const gist = await fetchSpecialGist(log)
  log.stop()
  console.log(Object.keys(gist.files).join('\n'))
}

module.exports = ls
