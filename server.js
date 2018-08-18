const express = require('express')
const app = express()
const resources = require('./lib/resources')
const config = require('config')

const control = (req, res) => {
  if (req.hostname === 'localhost' || req.hostname === '127.0.0.1') res.send('hello world')
  else {
    if (req.params.content && req.params.content.indexOf('.') > -1) res.status(404)
    else {
      resources.load(req)
        .then((render) => {
          res.send(render)
        })
        .catch((error) => {
          console.log(JSON.stringify(error))
          res.status(404)
        })
    }
  }
}

app.get('/', control)
app.get('/public/:file', (req, res) => {
  if (req.hostname === 'localhost' || req.hostname === '127.0.0.1') res.send('hello server')
  else {
    if (req.params.file && req.params.file.indexOf('.') > -1) {
      resources.getConfig()
        .then((config) => {
          res.sendFile(`${__dirname}/sites/${req.hostname}/templates/${config.template}/public/${req.params.file}`)
        })
        .catch((error) => {
          console.error(JSON.stringify(error))
          res.status(404)
        })
    } else res.status(404)
  }
})

app.get('/:content', control)

app.listen(config.port, () => {
  console.log('Server: listening on port 3000!')
})
