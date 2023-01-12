import core from '@babel/core'
import types from '@babel/types'
import { fileURLToPath } from 'url'
import pathlib, { dirname } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url));

const sourceCode = `
  console.warn('警告')
  console.log('日志')
`

const logPlugin = {
  visitor: {
    CallExpression(path, state) {
      const { node } = path;
      
      // 找到 console.log /console.info ... 方法
      if(types.isMemberExpression(node.callee)){
        if(node.callee.object.name === 'console'){
          if(['log', 'info', 'warn', 'error'].includes(node.callee.property.name)){
            // 找到 console 方法所在的的位置
            const {line, column }  = node.loc.start;
            // 添加 代码位置参数
            node.arguments.push(types.stringLiteral(`${line}:${column}`));
            // 当前代码所在的文件名
            const filename = state.file.opts.filename;
            const relativeName = pathlib.relative(__dirname, filename).replace(/\\/g, '/');
            // 添加文件路径字符串参数
            node.arguments.push(types.stringLiteral(relativeName));
          }
        }
      }
    }
  }
}

const targetSource = core.transform(sourceCode, {
  plugins: [logPlugin],
  // 指定 sourceCode 文件名
  filename: 'sum.js'
})

console.log(targetSource.code)
// console.warn('警告', '2:2', 'sum.js');
// console.log('日志', '3:2', 'sum.js');