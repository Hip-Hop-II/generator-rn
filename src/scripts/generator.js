const sharp = require('sharp')
const fs = require('fs')
const path = require('path')
const os = require('os')
const rimraf = require('rimraf')
const execSync = require('child_process').execSync


/**
 * 用来自动生产app icon 图标
 */
class Generator {
  generate (originalImagePath) {
    const contentJson = this.makeContentsJson()
    const downloadPath = __dirname
    const folderPath = downloadPath.concat('/AppIcon.appiconset')

    // 生成目录
    this.writeFolder(folderPath)
    this.writeContentsJson(contentJson, folderPath)
    this.writeImages(originalImagePath, contentJson, folderPath).then(() => {
      // this.showFinder(folderPath)
    })
  }
  writeImages (originalImagePath, contentsJson, folderPath) {
    return Promise.all(
      contentsJson.images.map((object) => {
        const output = folderPath.concat(`/${object.filename}`)
        const size = object.size.split('x')[0]
        const scale = object.scale.replace('x', '')
        const finalSize = size * scale

        return new Promise((resolve) => {
          sharp(originalImagePath)
            .resize(finalSize, finalSize)
            .toFile(output, (error, info) => {
              console.log(error)
              resolve()
            })
        })
      })
    )
  }
  writeFolder (folderPath) {
    if (fs.existsSync(folderPath)) {
      rimraf.sync(folderPath)
    }
    fs.mkdirSync(folderPath)
  }
  writeContentsJson (json, folderPath) {
    const path = folderPath.concat('/Contents.json')
    fs.writeFileSync(path, JSON.stringify(json, null, 2).replace(new RegExp(": ", "g"), " : "))
  }
  /**
   * 获取Contents.json文件同时修改为所需要的
   */
  makeContentsJson () {
    const content = fs.readFileSync(__dirname + '/Contents.json', 'utf8')
    const json = JSON.parse(content)

    json.images = json.images.map((item) => {
      const size = item.size.split('x')[0]
      item.filename = `icon_${size}@${item.scale}.png`
      return item
    })
    return json
  }
}
const generate = new Generator()
generate.generate(path.resolve(__dirname, './Icon.png'))