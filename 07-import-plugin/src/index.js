import { flatten, concat } from 'lodash'

const arr1 = [[1], [2, 3, 5, [4]]];
const arr2 = ['a', 'b', 'c'];

console.log(concat(flatten(arr1), arr2))