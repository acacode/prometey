import './src/extensions/Element.js'
import './src/extensions/Array.js'
import { Prometey } from './src/Prometey'
import {
  createPrometeyObject,
  aggregatePrometeyObjectsTree,
} from './src/element'
import { createTag } from './src/createTag'
import { createDOMElements } from './src/DOM'

export { classes } from './src/classes'
// export { createElement } from './src/element'
export { createTag } from './src/createTag'

/* ---- short keywords ---- */
export const tag = createTag
export const createElement = createPrometeyObject
export const create = createPrometeyObject
export const elem = createPrometeyObject
export const element = createPrometeyObject
/* ---- short keywords ---- */

// let PrometeyTree = []

/** should call only once for create tree of one prometey app */
Prometey.connect = (...trees) => {
  if (trees[0].constructor.name === 'Function') {
    const component = new Prometey(trees[0], trees[1])
    const prometeyElementsTree = aggregatePrometeyObjectsTree(
      component.render()
    )
    createDOMElements(prometeyElementsTree)
    console.log('prometeyElementsTree', prometeyElementsTree)
    // PrometeyTree.push(prometeyElementsTree)
  } else {
    for (let x = 0; x < trees.length; x++) {
      const prometeyElementsTree = aggregatePrometeyObjectsTree(trees[x])
      createDOMElements(prometeyElementsTree)
      console.log('prometeyElementsTree', prometeyElementsTree)
      // PrometeyTree.push(trees[x])
    }
  }
}

export default Prometey
