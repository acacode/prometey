import './polyfills/object.watch.js'
import './extensions/Element.js'
import './extensions/Array.js'
import { Prometey } from './Prometey'
import { createElement, createTree } from './element'
import { createTag } from './createTag'
import { attachToDOM } from './DOM'

export { classes } from './classes'
export { createElement } from './element'
export { createTag } from './createTag'

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
  console.log('delTree', pelTree)
  // attachDOM(dEls)
  PrometeyTree.push(tree)
}

export default Prometey
