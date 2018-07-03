import { classes } from './classes'
import Prometey from '../index'
import { addPropertyToElement } from './DOM'
/**
 * Parse query selector to id, parent, tag, classNames information
 * It needed for create pEl and dEl elements
 *
 *
 * @param {string} queryString
 * @param {(Array<string> | string)} classNames
 *
 * @returns {Object}
 */
const parseElement = element => {
  let [parent, query] = element.query.split('->')
  if (!query) {
    query = parent
    parent = null
  }
  const [tagAndId, ...className] = query.split('.')
  const [tag, id] = tagAndId.split('#')
  const classNames = element.props && element.props.class
  return {
    class: classes(className, classNames),
    id,
    parent,
    tag,
  }
}

function createDOMelement(element) {
  element.data = parseElement(element)
  const { class: className, id, parent, tag } = element.data
  const dom = document.createElement(tag)
  if (className.length) {
    dom.className = className
  }
  if (id) {
    dom.setAttribute('id', id)
  }
  if (element.props !== null) {
    if (typeof element.props === 'object') {
      const keys = Object.keys(element.props)
      for (let x = 0; x < keys.length; x++) {
        const name = keys[x]
        addPropertyToElement(tag, dom, element.props[name], name)
      }
    } else {
      addPropertyToElement(tag, dom, element.props, 'value')
    }
  }

  if (parent) {
    const parentElement = document.querySelector(parent)
    if (parentElement) {
      parentElement.appendChild(dom)
    } else {
      console.error(`Element by query "${parent}" is not found`)
    }
  }
  element.dom = dom
}

export function createPrometeyElement(element, parent) {
  if (!element) {
    element = createElement(element, null)
  }
  if (!element.query) {
    console.log('empty element')
  } else {
    if (element.isComponent) {
      console.log('element is component')
      const component = Prometey(element)
      element.componentData = createPrometeyElement(component.render(), element)
      attachWatcher(element, component)
    } else {
      console.log('simple element')
      createDOMelement(element)
      if (element.childs.length) {
        for (let x = 0; x < element.childs.length; x++) {
          const child = element.childs[x]
          if (child) {
            createPrometeyElement(child, element)
            if (child.isComponent) {
              element.dom.appendChild(child.componentData.dom)
            } else {
              element.dom.appendChild(child.dom)
            }
          }
        }
      }
    }
  }
  return element
}

// function Element(query, props)
/**
 *
 * @param {*} query
 * @param {*} props
 *
 * @returns { query: (string|Class|null), childs: Array, props:(Object|null) }
 */
export function createElement(query, props) {
  const isComponent = typeof query !== 'string'
  if (!query) {
    return {
      query: null,
      childs: [],
      props: null,
      isComponent,
    }
  }

  if (props instanceof Array) {
    return {
      query,
      childs: props,
      props: null,
      isComponent,
    }
  }

  if (typeof props === 'object') {
    let onlyProps = null
    let childs = []
    const propKeys = Object.keys(props)
    for (let x = 0; x < propKeys.length; x++) {
      const key = propKeys[x]
      if (key === 'childs') {
        childs = [...props[key]]
      } else {
        if (!onlyProps) {
          onlyProps = {}
        }
        onlyProps[key] = props[key]
      }
    }
    return {
      query,
      childs,
      props: onlyProps,
      isComponent,
    }
  }

  return {
    query,
    props,
    childs: [],
    isComponent,
  }
}

function attachWatcher(element, component) {
  let updateTimer = null

  const rawUpdate = component.setState

  component.setState = stateData => {
    const shouldUpdate = rawUpdate(stateData)
    if (shouldUpdate) {
      clearTimeout(updateTimer)
      updateTimer = setTimeout(() => {
        updateTimer = null
        console.log('update timer fired')
        updateComponent(element, component, 'null') // TODO
      }, component.rerenderTimer)
    }
  }
}
