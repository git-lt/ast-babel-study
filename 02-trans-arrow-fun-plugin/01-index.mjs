import core from '@babel/core'

const sourceCode = `
const sum = (a, b) => {
  return a + b;
}
`

const arrowFunctionPlugin = {
  visitor: {
    ArrowFunctionExpression(path){
      let { node } = path;
      node.type = 'FunctionExpression'
    }
  }
}

const targetSource = core.transform(sourceCode, {
  plugins: [arrowFunctionPlugin]
})

console.log(targetSource.code)
// const sum = function (a, b) {
//   return a + b;
// };