import './src/extensions/Element.js'
import './src/extensions/Array.js'
import { Prometey } from './src/Prometey'
import { createElement, createTree } from './src/element'
import { createTag } from './src/createTag'
import { attachToDOM } from './src/DOM'

export { classes } from './src/classes'
export { createElement } from './src/element'
export { createTag } from './src/createTag'

/* ---- short keywords ---- */
export const tag = createTag
export const create = createElement
export const elem = createElement
export const element = createElement
/* ---- short keywords ---- */

let PrometeyTree = []

/** should call only once for create tree of one prometey app */
Prometey.connect = (...trees) => {
  if (trees[0].constructor.name === 'Function') {
    const component = new Prometey(trees[0], trees[1])
    const pelTree = createTree(component.render())
    attachToDOM(pelTree)
    PrometeyTree.push(pelTree)
  } else {
    for (let x = 0; x < trees.length; x++) {
      const pelTree = createTree(trees[x])
      attachToDOM(pelTree)
      PrometeyTree.push(trees[x])
    }
  }
}

export default Prometey
