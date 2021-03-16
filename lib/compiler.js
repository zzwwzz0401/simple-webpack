//模块构建
//最终文件输出

const { getAST, getDependencies, transform } = require('./parser')
const path = require('path')
const fs = require('fs')

module.exports = class Compiler {

    constructor(options) {
        const { entry, output } = options
        this.entry = entry
        this.output = output
        this.modules = []
    }

    //入口
    run() {
        const enteyModule = this.buildModule(this.entry, true)
        this.modules.push(enteyModule)
        //处理依赖
        this.modules.map(_modele => {
            _modele.dependencies.map(dependency => {
                this.modules.push(this.buildModule(dependency))
            })
        })
        this.emitFiles()
    }

    //模块构建
    buildModule(filename, isEntry) {
        let ast
        if (isEntry) {
            ast = getAST(filename)
        } else {
            //相对路径转换成绝对路径
            const absolutePath = path.join(process.cwd(), './src', filename)
            ast = getAST(absolutePath)
        }

        return {
            filename,
            dependencies: getDependencies(ast),
            source: transform(ast)
        }
    }
    
    //输出文件
    emitFiles() {
        const outputPath = path.join(this.output.path, this.output.filename)
        let modules = ''
        this.modules.map(_modele => {
            modules += `'${_modele.filename}':function(require,module,exports){${_modele.source}},`
        })
        const bundle = `(function(modules){
            function require(filename){
                var fn = modules[filename]
                var module = {exports:{}}
                fn(require,module,module.exports)
                return module.exports
            }
            require('${this.entry}')
        })({${modules}})`
        fs.writeFileSync(outputPath, bundle, 'utf-8')
    }
}