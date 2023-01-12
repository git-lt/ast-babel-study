/**
 * 按需导入插件
 * import { flatten, get } from 'lodash'
 * => 
 * import flatten from 'lodash/flatten'
 * import get from 'lodash/get'
 */
const types = require('@babel/types');
const template = require('@babel/template')

const visitor = {
  ImportDeclaration(path, state){
    // 获取插件配置中的数据
    const { libraryName, libraryDirectory = ''} = state.opts;

    const { node } = path;
    // 获取导入的变量数组
    const { specifiers } = node;
    // 导入的模块是指定的模块，并且不是导入的 default 如: import lodash form 'lodash'; 不成立
    if(node.source.value === libraryName && !types.isImportDefaultSpecifier(specifiers[0])){
      // 遍历导入的变量，生成新的导入节点
      const declarations = specifiers.map((specifier) => {
        const pathTpl = libraryDirectory
          ? `${libraryName}/${libraryDirectory}/${specifier.imported.name}`
          : `${libraryName}/${specifier.imported.name}`;
        // console.log(`import ${specifier.local.name} from '${pathTpl}';`);
        // 使用 template 生成节点
        return template.statement(`import ${specifier.local.name} from '${pathTpl}';`)();

        // 返回一个新的导入语句节点
        // return types.importDeclaration(
        //   [types.importDefaultSpecifier(specifier.local)],
        //   types.stringLiteral(
        //     libraryDirectory
        //       ? `${libraryName}/${libraryDirectory}/${specifier.imported.name}`
        //       : `${libraryName}/${specifier.imported.name}`
        //   )
        // );
      })
      // 替换当前节点
      path.replaceWithMultiple(declarations);
    }

  }
}

module.exports = function(){
  return {
    visitor
  }
}