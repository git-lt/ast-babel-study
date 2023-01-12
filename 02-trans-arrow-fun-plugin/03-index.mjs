/**
 * 箭头函数中this的处理
 */
import core from '@babel/core'
import types from '@babel/types'

const sourceCode = `
var bob = {
  _name: 'Bob',
  _friends: ['Sally', 'Tom'],
  printFriends() {
    this._friends.forEach(f => console.log(this._name + ' knows ' + f));
  },
};
`;

// const sum = (a, b) => {
//   console.log(this);
//   return a + b;
// };
/**
 * 
 * 1. 找到当前简单函数的作用域，即：最近的一个非箭头函数的函数节点，如果没有，则返回 根节点
 */
function hoistFunctionEnvironment(path){
  // 循环向上找到当前箭头函数的作用域
  const thisEnv = path.findParent(parent => {
    // 找到父节点是非箭头函数的函数节点，没找到则返回 根节点 isArrowFunctionExpression
    console.log(parent.type);
    // CallExpression
    // ExpressionStatement;
    // BlockStatement;
    // ObjectMethod;
    return (parent.isFunction() && !parent.isArrowFunctionExpression()) || parent.isProgram();
  })

  // 向父作用域添加 var _this = this;
  thisEnv.scope.push({
    // 生成标识符节点 _this
    id: types.identifier('_this'),
    // 设置标识符节点的值为 this
    init: types.thisExpression(),
  })

  let thisPaths = [];

  // 找到箭头函数内所有的 this 
  path.traverse({
    ThisExpression(thisPath){
      thisPaths.push(thisPath)
    }
  })

  // this 替换为 _this
  thisPaths.forEach(thisPath => {
    thisPath.replaceWith(types.identifier('_this'));
  })
}

const arrowFunctionPlugin = {
  visitor: {
    ArrowFunctionExpression(path){
      let { node } = path;
      node.type = 'FunctionExpression'

      // 处理当前节点的 this
      hoistFunctionEnvironment(path);

      // 如果不是块语句，则添加块并添加 return;
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
