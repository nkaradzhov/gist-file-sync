const path = require('path')

const utf8 = 'utf8'

const configname = path.join(process.env[(process.platform === 'win32')
    ? 'USERPROFILE'
    : 'HOME'], '.gist-file-sync')
    
const baseUrl = 'https://api.github.com/'

module.exports = {
  utf8,
  configname,
  baseUrl
}
