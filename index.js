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
Prometey.connect = tree => {
  const pelTree = createTree(tree)
  attachToDOM(pelTree)
  PrometeyTree.push(tree)
}

export default Prometey
