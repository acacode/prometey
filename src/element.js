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
  return {
    rootClass: classes(className),
    id,
    parent,
    tag,
  }
}

function createDOMelement(element) {
  element.data = parseElement(element)
  element.data.class = element.props ? element.props.class || '' : ''
  const { rootClass, class: className, id, parent, tag } = element.data
  const dom = document.createElement(tag)
  if (rootClass.length || className.length) {
    dom.className = classes(rootClass, className)
  }
  if (id) {
    dom.setAttribute('id', id)
  }
  if (element.props !== null) {
    const keys = Object.keys(element.props)
    for (let x = 0; x < keys.length; x++) {
      const name = keys[x]
      if (name !== 'class') {
        addPropertyToElement(tag, dom, element.props[name], name)
      }
    }
  }

  if (element.childs.length) {
    for (let x = 0; x < element.childs.length; x++) {
      const child = element.childs[x]
      if (child) {
        createPrometeyElement(child, element)
        if (child.isComponent) {
          dom.appendChild(child.componentData.dom)
        } else {
          dom.appendChild(child.dom)
        }
      }
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

export function removePrometeyElement(element) {
  if (element.dom) {
    for (let x = 0; x < element.childs.length; x++) {
      if (element.childs[x] && element.childs[x].dom) {
        element.dom.removeChild(element.childs[x].dom)
      }
      element.childs[x] = null
    }
    element.dom.parentNode.removeChild(element.dom)
    element.dom = null
  }
  element = null
}

export function createPrometeyElement(element, parent) {
  if (!element) {
    element = createElement(element, null)
    return element
  }
  // if (!element.query) {
  // console.log('empty element')
  // } else {
  if (element.isComponent) {
    console.log('element is a component')
    const component = Prometey(element)
    element.componentData = createPrometeyElement(component.render(), element)
    element.state = Object.assign({}, component.state)
    attachWatcher(element, component)
  } else {
    console.log('element is a simple html element')
    createDOMelement(element)
  }
  // }
  return element
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
      }, component.rerenderTime)
    }
  }
}

/**
 * function for updating HTML element and updating PrometeyElement
 *
 * @param {'delete' | 'add' | 'update'} type type of update property
 * @param {PrometeyElement} element
 * @param prop Information about the prop.
 * @param prop.name The name of the prop.
 * @param prop.value The value of the prop.
 */
function updateElementProp(type, element, prop) {
  // TODO: написать также обновление проспов у самих компонентов
  switch (type) {
    case 'delete': {
      break
    }
    case 'update': {
      if (typeof prop.value === 'object') {
        const keys = Object.keys(prop.value)
        for (let x = 0; x < keys.length; x++) {
          const name = keys[x]
          if (name !== 'class') {
            addPropertyToElement(
              element.tag,
              element.dom,
              prop.value[name],
              name
            )
          } else {
            // TODO change it
            element.props[name] = prop.value[name]
            element.data = parseElement(element)
            element.dom.className = element.data.class
          }
        }
        element.props[prop.name] = Object.assign({}, prop.value)
      } else {
        if (element.props[prop.name] !== prop.value) {
          element.data[prop.name] = prop.value
          element.props[prop.name] = prop.value
          if (prop.name === 'class') {
            element.dom.className = classes(
              element.data.rootClass,
              element.data.class
            )
          } else {
            addPropertyToElement(
              element.tag,
              element.dom,
              prop.value,
              prop.name
            )
          }
        }
      }
      break
    }
    case 'add': {
      const keys = Object.keys(prop.value)
      for (let x = 0; x < keys.length; x++) {
        const name = keys[x]
        if (name !== 'class') {
          addPropertyToElement(element.tag, element.dom, prop.value[name], name)
        } else {
          element.props[name] = prop.value[name]
          element.data = parseElement(element)
          element.dom.className = element.data.class
        }
      }
      element.props[prop.name] = Object.assign({}, prop.value)
      break
    }
  }
}

function updatePrometeyElement(prometeyElement, newPrometeyElement) {
  if (prometeyElement.props !== null && newPrometeyElement.props !== null) {
    const allPropsNew =
      prometeyElement.props === null &&
      typeof newPrometeyElement.props === 'object'
    const allPropsRemove =
      newPrometeyElement.props === null &&
      typeof prometeyElement.props === 'object'

    const propDiffs = compareObjects(
      allPropsNew ? {} : prometeyElement.props,
      allPropsRemove ? {} : newPrometeyElement.props
    )

    if (propDiffs.hasDiff) {
      const keys = Object.keys(propDiffs)
      for (let x = 0; x < keys.length; x++) {
        const diffArray = propDiffs[keys[x]]
        if (keys[x] !== 'hasDiff' && diffArray.length) {
          for (let y = 0; y < diffArray.length; y++) {
            updateElementProp(keys[x], prometeyElement, diffArray[y])
          }
        }
      }
    }
  }
  if (prometeyElement.isComponent && !newPrometeyElement.isComponent) {
  } else if (!prometeyElement.isComponent && newPrometeyElement.isComponent) {
  } else if (!prometeyElement.isComponent && !newPrometeyElement.isComponent) {
    const lengthIsEquals =
      prometeyElement.childs.length === newPrometeyElement.childs.length
    const flattedChilds =
      !lengthIsEquals &&
      flatChilds(prometeyElement.childs, newPrometeyElement.childs)
    const curChilds = lengthIsEquals ? prometeyElement.childs : flattedChilds[0]
    const newChilds = lengthIsEquals
      ? newPrometeyElement.childs
      : flattedChilds[1]
    for (let x = 0; x < curChilds.length; x++) {
      if (curChilds[x] && !newChilds[x]) {
        // TODO: remove
        removePrometeyElement(prometeyElement, x)
        curChilds[x] = false
      } else if (newChilds[x] && !curChilds[x]) {
        // TODO: add
        curChilds[x] = createPrometeyElement(newChilds[x])
        prometeyElement.dom.insertChildAtIndex(curChilds[x].dom, x)
      } else if (newChilds[x] && curChilds[x]) {
        // TODO: update
        updatePrometeyElement(curChilds[x], newChilds[x])
      }
    }
  }
}

function updateComponent(element, component) {
  const diffProps = compareObjects(element.props, component.props)
  const diffState = compareObjects(element.state, component.state)
  if (diffProps.hasDiff || diffState.hasDiff) {
    if (diffState.hasDiff) {
      element.state = Object.assign({}, component.state)
    }
    updatePrometeyElement(element.componentData, component.render())
  }
}

function flatChilds(curChilds = [], newChilds = []) {
  const curLength = curChilds ? curChilds.length : 0
  const newLength = newChilds ? newChilds.length : 0
  const childs = []
  const aChilds = []
  if (curLength > newLength) {
    for (let x = 0; x < curLength; x++) {
      childs.push(curChilds[x])
      aChilds.push(newChilds[x] || false)
    }
  } else if (curLength < newLength) {
    for (let x = 0; x < newLength; x++) {
      childs.push(curChilds[x] || false)
      aChilds.push(newChilds[x] || false)
    }
  }
  return [childs, aChilds]
}

function compareObjects(curObj, newObj) {
  let diffObj = {
    delete: [],
    update: [],
    add: [],
    hasDiff: false,
  } // Пропсы либо новые, либо те которые мы должны обновить
  if (
    (curObj === undefined && newObj === null) ||
    (curObj === null && newObj === undefined)
  ) {
    return { hasDiff: false }
  }
  const addTo = (type, name, value) => diffObj[type].push({ name, value })
  const curKeys = Object.keys(curObj)
  const newKeys = Object.keys(newObj)
  if (curKeys.length > newKeys.length) {
    // текущих ключей больше
    for (let x = 0; x < curKeys.length; x++) {
      const curKey = curKeys[x]
      if (newObj[curKey] === undefined && curObj[curKey]) {
        addTo('delete', curKey)
      } else if (curObj[curKey] === undefined && newObj[curKey]) {
        addTo('add', curKey, newObj[curKey])
      } else if (
        typeof newObj[curKey] === 'object' && typeof curObj[curKey] === 'object'
          ? compareObjects(curObj[curKey], newObj[curKey]).hasDiff
          : newObj[curKey] !== curObj[curKey]
      ) {
        addTo('update', curKey, newObj[curKey])
      }
    }
  } else if (newKeys.length > curKeys.length) {
    // новых ключей больше
    for (let x = 0; x < newKeys.length; x++) {
      const newKey = newKeys[x]
      if (newObj[newKey] === undefined && curObj[newKey]) {
        addTo('delete', newKey)
      } else if (curObj[newKey] === undefined && newObj[newKey]) {
        addTo('add', newKey, newObj[newKey])
      } else if (
        typeof newObj[newKey] === 'object' && typeof curObj[newKey] === 'object'
          ? compareObjects(curObj[newKey], newObj[newKey]).hasDiff
          : newObj[newKey] !== curObj[newKey]
      ) {
        addTo('update', newKey, newObj[newKey])
      }
    }
  } else if (newKeys.length === curKeys.length) {
    // количество новый и текущих равны
    for (let x = 0; x < newKeys.length; x++) {
      const newKey = newKeys[x]
      if (newObj[newKey] === undefined && curObj[newKey]) {
        addTo('delete', newKey)
      } else if (curObj[newKey] === undefined && newObj[newKey]) {
        addTo('add', newKey, newObj[newKey])
      } else if (
        typeof newObj[newKey] === 'object' && typeof curObj[newKey] === 'object'
          ? compareObjects(curObj[newKey], newObj[newKey]).hasDiff
          : newObj[newKey] !== curObj[newKey]
      ) {
        addTo('update', newKey, newObj[newKey])
      }
    }
  }
  diffObj.hasDiff = !!(
    diffObj.add.length ||
    diffObj.delete.length ||
    diffObj.update.length
  )
  return diffObj
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
  if (!query) {
    return {
      query: null,
      childs: [],
      props: null,
      isComponent: false,
    }
  }

  const isComponent = typeof query !== 'string'

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
    props: {
      value: props,
    },
    childs: [],
    isComponent,
  }
}
