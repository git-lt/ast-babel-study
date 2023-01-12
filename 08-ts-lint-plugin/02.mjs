/**
 * babel 实现 TS 类型校验
 */
import core from '@babel/core';

const sourceCode = `
  let age:number;
  age = "12";
`;

function transformType(type) {
  switch (type) {
    case 'TSNumberKeyword':
    case 'NumberTypeAnnotation':
      return 'number';
    case 'TSStringKeyword':
    case 'StringTypeAnnotation':
      return 'string';
  }
}

const tsCheckPlugin = {
  pre(file) {
    file.set('errors', []);
  },
  visitor: {
    AssignmentExpression(path, state) {
      const errors = state.file.get('errors');
      const variable = path.scope.getBinding(path.get('left'));
      const variableAnnotation = variable.path.get('id').getTypeAnnotation();
      const variableType = transformType(variableAnnotation.type);

      const valueType = transformType(path.get('right').getTypeAnnotation().type);

      if (valueType !== variableType) {
        Error.stackTraceLimit = 0;
        errors.push(path.get('init').buildCodeFrameError(`无法把${valueType}类型赋值${variableType}类型`, Error));
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
/**
 [Error: 无法把string类型赋值number类型]
let age: number;
age = "12";
 */
