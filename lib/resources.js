const ejs = require('ejs')
const fs = require('fs')
const markdown = require('markdown').markdown

const resources = {
  load (req) {
    return new Promise((resolve, reject) => {
      resources.getConfig(req)
        .then((config) => {
          var files = [{ key: 'main',  url: `./sites/${req.hostname}/content/pages/${req.params.content?req.params.content:'main'}.md` }]
          if (config.fragments) {
            config.fragments.forEach((fragment) => {
              files.push({ key: fragment, url: `./sites/${req.hostname}/content/${fragment}.md` })
            })
          }

          Promise.all(files.map(resources.getFile))
            .then((res) => {
              resources.getFile({ key: 'template', url: `./sites/${req.hostname}/templates/${config.template}/files/main.ejs` })
                .then((template) => {
                  console.log("error: " + JSON.stringify(template))
                  const data = res.reduce((obj, item) => {
                    obj[item.key] = item.data
                    return obj
                  },{})

                  const render = ejs.render(template, data)
                  resolve(render)
                })
                .catch((error) => {
                  reject(error)
                })
            })
            .catch((error) => {
              reject(JSON.stringify(error))
            })
        })
        .catch((error) => {
          console.log('aqui')
          reject(error)
        })
    })
  },
  getFile (file) {
    return new Promise((resolve, reject) => {
      fs.readFile(file.url, 'utf8', (error, data) => {
        if (error) reject(error)
        else {
          if (file.key !== 'template') {
            const dataparsed = markdown.toHTML(data, 'Maruku')
            resolve({ key: file.key, data: dataparsed })
          } else resolve(data)
        }
      })
    })
  },
  getConfig (req) {
    return new Promise((resolve, reject) => {
      fs.readFile(`./sites/${req.hostname}/config.json`, 'utf8', (error, config_file) => {
        if (error) reject(error)
        else {
          const data = JSON.parse(config_file)
          resolve(data)
        }
      })
    })
  }
}

module.exports = resources
