/**
 * 向函数自动注入 logger 函数，用来记录函数调用上传日志
 */
import core, { types } from '@babel/core'

const sourceCode = `
  //四种声明函数的方式
  function sum(a, b) {
    return a + b;
  }
  const multiply = function (a, b) {
    return a * b;
  };
  const minus = (a, b) => a - b;
  class Calculator {
    divide(a, b) {
      return a / b;
    }
  }
`;

const autoImportPlugin = {
  visitor: {
    Program(path, state){
      let loggerId;

      // 检查是否已经导入 logger 模块
      // 遍历子节点
      path.traverse({
        // 检查 import 节点，有没有导入过 logger
        ImportDeclaration(path){
          const { node } = path;
          // 如果导入过，则获取导入的变量名
          if(node.source.value === 'logger'){
            const specifiers = node.specifiers[0];
            // 获取导入的第一个变量名
            loggerId = specifiers.local.name;
            // 终止循环
            path.stop();
          }
        }
      })

      // 如果没有导入 logger 模块，则生成一个 logger 的导入节点
      if(!loggerId){
        // 在当前作用域下生成一个不会冲突的变量名 _loggerLib
        // 如果当前作用域已经有 _loggerLib ，则会生成 _loggerLib1
        loggerId = path.scope.generateUid('loggerLib');
        path.node.body.unshift(
          // 生成 import loggerLib from 'logger'; 导入语句节点
          types.importDeclaration(
            [types.importDefaultSpecifier(types.identifier(loggerId))],
            types.stringLiteral('logger')
          )
        );
      }

      // 在 state 上挂一个 loggerLib() 函数调用节点
      state.loggerNode = types.expressionStatement(
        // 生成一个 loggerLib() 函数调用节点，传参[] 表示没有参数
        types.callExpression(types.identifier(loggerId), [])
      )

    },
    // 四种函数定义方式的节点
    'FunctionDeclaration|FunctionExpression|ArrowFunctionExpression|ClassMethod'(path, state) {
      const { node } = path;
      // 如果是一个块级语句，则在最上面插入 loggerLib() 节点
      if(types.isBlockStatement(node.body)){
        node.body.body.unshift(state.loggerNode)
      }else{
        // 如果是箭头函数没有块级语句，则生成一个块级语句，第一行插入 loggerLib() 节点，然后 return 之前的内容
        const newBody = types.blockStatement([
          state.loggerNode,
          types.returnStatement(node.body)
        ])
        // 替换老的节点
        node.body = newBody;
      }
    }
  }
}

const targetCode = core.transform(sourceCode, {
  plugins: [autoImportPlugin]
})

console.log(targetCode.code)

/** 生成的结果
 import _loggerLib from "logger";
//四种声明函数的方式
function sum(a, b) {
  _loggerLib();
  return a + b;
}
const multiply = function (a, b) {
  _loggerLib();
  return a * b;
};
const minus = (a, b) => {
  _loggerLib();
  return a - b;
};
class Calculator {
  divide(a, b) {
    _loggerLib();
    return a / b;
  }
}
 */