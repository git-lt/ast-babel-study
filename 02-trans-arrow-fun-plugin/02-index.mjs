/**
 * 简写的箭头函数处理
 */
import core from '@babel/core'
import types from '@babel/types'

const sourceCode = `
const sum = (a, b) => a + b;
`;

const arrowFunctionPlugin = {
  visitor: {
    ArrowFunctionExpression(path){
      let { node } = path;
      node.type = 'FunctionExpression'

      if(!types.isBlockStatement(node.body)){
        node.body = types.blockStatement([types.returnStatement(node.body)]);
      }
    }
  }
}

const targetSource = core.transform(sourceCode, {
  plugins: [arrowFunctionPlugin]
})

console.log(targetSource.code);
// const sum = function (a, b) {
//   return a + b;
// };