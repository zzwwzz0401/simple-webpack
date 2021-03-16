//转换AST
//分析依赖
const fs = require('fs')
const babylon = require('babylon')  //转换AST
const traverse = require('babel-traverse').default  //获取依赖
const { transformFromAst } = require('babel-core')

module.exports = {

    //获取AST
    getAST: (path) => {
        const source = fs.readFileSync(path, 'utf-8')

        return babylon.parse(source, {
            sourceType: 'module'
        })
    },

    //分析依赖
    getDependencies: (ast) => {
        const dependencies = []
        traverse(ast, {
            ImportDeclaration: ({ node }) => {
                dependencies.push(node.source.value)
            }
        })
        return dependencies
    },

    //AST转换成源码
    transform: (ast) => {
        const { code } = transformFromAst(ast, null, {
            presets: ['env']
        })
        return code
    }
}