import parser from '@babel/parser'
import traverse from '@babel/traverse'
import generator from '@babel/generator'

const code = `const hello = () => {}`

// 解析成ast对象
const ast = parser.parse(code);

// console.log(JSON.stringify(ast, null, 2));

// 定义转换器
const visitor = {
  Identifier(path){
    const { node } = path;
    if(node.name === 'hello'){
      node.name = 'world';
    }
  }
}

// 遍历ast，进行修改
traverse.default(ast, visitor);

const result = generator.default(ast, {}, code);

// const world = () => {};
console.log(result.code)

