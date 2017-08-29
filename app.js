const { promisify } = require('util')
const fs = require('fs')
const writeFile = promisify(fs.writeFile)
const readFile = promisify(fs.readFile)
const fetch = require('node-fetch')
const fetchJson = (...args) => fetch(...args).then(r => r.json())
const program = require('commander')

const utf8 = 'utf8'

const token = fs.readFileSync('token', utf8).trim()
const authenticated = { headers: { Authorization: `token ${token}`}}

const baseUrl = 'https://api.github.com/'
const gistId = fs.readFileSync('gist', utf8).trim()
const specialGistUrl = baseUrl + `gists/${gistId}`

const pull = async fileName => {
  const gist = await fetchJson(specialGistUrl, authenticated)
  const file = gist.files[fileName]
  await writeFile(file.filename, file.content, utf8)
  console.log('done')
}

const push = async fileName => {
  const content = await readFile(fileName, utf8)
  const response = await fetchJson(specialGistUrl, {
    ...authenticated,
    method: 'PATCH',
    body: JSON.stringify({
      files: {
        [fileName]: { content }
      }
    })
  })
  console.log('done')
}

const ls = async () => {
  const gist = await fetchJson(specialGistUrl, authenticated)
  console.log(Object.keys(gist.files).join('\n'))
}

const rm = async fileName => {
  const response = await fetchJson(specialGistUrl, {
    ...authenticated,
    method: 'PATCH',
    body: JSON.stringify({
      files: {
        [fileName]: null
      }
    })
  })
  console.log('done')
}

program
  .version('0.1.0')

program
  .command('pull [name]')
  .description('Pull file from the gist')
  .action(pull)
  
program
  .command('push [name]')
  .description('Push file to the gist')
  .action(push)
  
program
  .command('rm [name]')
  .description('Remove file from the gist')
  .action(rm)
  
program
  .command('ls')
  .description('List all files in the gist')
  .action(ls)
  
program.parse(process.argv)

if (!process.argv.slice(2).length) {
  program.outputHelp()
}

