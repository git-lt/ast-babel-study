import { transformSync } from '@babel/core';

const sourceCode = `
 function getAge(){
   var age = 12;
   console.log(age);
   var name = 'zhufeng';
   console.log(name);
 }
`;

const unglifyPlugin = () => {
  return {
    visitor: {
      // 捕获能生成作用域的节点 （函数、类的函数、函数表达式、语句块、if else 、while、for等）
      Scopable(path) {
        // console.log(Object.keys(path.scope.bindings));
        // 给所有作用域的变量重命名
        
        Object.entries(path.scope.bindings).forEach(([key, bindings]) => {
          // 在当前作用域内生成一个新的uid，并且不会和任何本地定义的变量冲突的标识符
          const newName = path.scope.generateUid();
          bindings.path.scope.rename(key, newName);
        });
      },
    },
  };
}
const { code } = transformSync(sourceCode, {
  plugins: [unglifyPlugin()]
})

console.log(code);
/**
 function _temp() {
  var _temp4 = 12;
  console.log(_temp4);
  var _temp5 = 'zhufeng';
  console.log(_temp5);
}
 */