const { fetchSpecialGist } = require('../utils')

const ls = async() => {
  const gist = await fetchSpecialGist()
  console.log(Object.keys(gist.files).join('\n'))
}

module.exports = ls
