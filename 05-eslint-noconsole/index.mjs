/**
 * noconsole: 不允许代码中出现 console.log
 */
import core from '@babel/core'
import path from 'path'

const sourceCode = `
  var a = 1;
  console.log(a);
  var b = 2;
`

const eslintPlugin = ({ fix }) => {
  return {
    pre(file){
      file.set('errors', [])
    },
    visitor: {
      CallExpression(path, state){
        const errors = state.file.get('errors');
        const { node } = path;
        if(node.callee.object && node.callee.object.name === 'console'){
          // 构造一个语法错误
          errors.push(path.buildCodeFrameError('代码中不能出现console语句', Error))
        }
        if(fix){
          path.parentPath.remove();
        }
      }
    },
    post(file){
      console.log(...file.get('errors'));
    }
  }
}

const targetSource = core.transform(sourceCode, {
  plugins: [eslintPlugin({ fix: true })]
})

console.log(targetSource.code);

/**
 Error: 代码中不能出现console语句
  1 |
  2 |   var a = 1;
> 3 |   console.log(a);
    |   ^^^^^^^^^^^^^^
  4 |   var b = 2;
 */