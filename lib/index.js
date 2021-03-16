//入口文件

const Compiler = require('./compiler')
const options = require('../simplepack.config.js')

new Compiler(options).run()