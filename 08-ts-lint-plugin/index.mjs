/**
 * babel 实现 TS 类型校验
 */
import core from '@babel/core';

const sourceCode = `
  const age:number = '12';
`;

const TypeAnnotationMap = {
  TSNumberKeyword: 'NumbericLiteral',
};

const tsCheckPlugin = {
  pre(file) {
    file.set('errors', []);
  },
  visitor: {
    VariableDeclarator(path, state) {
      const errors = state.file.get('errors');

      const { node } = path;
      const idType = TypeAnnotationMap[node.id.typeAnnotation.typeAnnotation.type];
      const initType = node.init.type;

      if (idType !== initType) {
        errors.push(path.get('init').buildCodeFrameError(`无法把${initType}类型赋值${idType}类型`, Error));
      }
    },
  },
  post(file) {
    console.log(...file.get('errors'));
  },
};

const targetSource = core.transform(sourceCode, {
  parserOpts: {
    plugins: ['typescript'],
  },
  plugins: [tsCheckPlugin],
});

console.log(targetSource.code);
/** 输出
 Error: 无法把StringLiteral类型赋值NumbericLiteral类型
  1 |
> 2 |   const age:number = '12';
    |                      ^^^^
  3 |
 */
