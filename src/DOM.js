import _ from 'lodash'
// import { updateElementByProps } from './props'

export const createDOMElements = prometeyElements => {
  _.each(prometeyElements, prometeyElement => {
    prometeyElement.element = createDOMElement(prometeyElement)
    if (prometeyElement.childs && prometeyElement.childs.length) {
      createDOMElements(prometeyElement.childs)
      _.forEach(prometeyElement.childs, child => {
        if (!child.isNegative) {
          prometeyElement.element.appendChild(child.element)
        }
      })
    }
  })
}
export const createDOMElement = prometeyElement => {
  const { tag, id, parent, properties, isNegative } = prometeyElement
  if (isNegative) {
    return null
  }
  const element = document.createElement(tag)
  if (prometeyElement.class.length) {
    element.className = prometeyElement.class
  }
  if (id) {
    element.setAttribute('id', id)
  }
  if (!_.isUndefined(properties)) {
    updateElement(tag, element, prometeyElement)
  }

  if (parent) {
    const parentElement = document.querySelector(parent)
    if (parentElement) {
      parentElement.appendChild(element)
    } else {
      console.error(`Element by query "${parent}" is not found`)
    }
  }
  return element
}

export const createDOMText = (PUID, value) =>
  `<!--${PUID}-t--> ${value} <!--${PUID}-t-->`

export const updateElement = (
  tag,
  element,
  prometeyElement,
  oldPrometeyElement
) => {
  let props = prometeyElement.properties
  const PUID = prometeyElement.PUID
  if (!oldPrometeyElement) {
    if (_.isObject(props)) {
      _.forEach(props, (value, name) => {
        addPropertyToElement(tag, element, value, name, prometeyElement.PUID)
      })
    } else {
      addPrimitiveToElement(tag, element, props, prometeyElement.PUID)
    }
  } else {
    let newProps = oldPrometeyElement.properties
    //   const noChilds = !_.get(oldPrometeyElement.childs, 'length')

    if (_.isObject(newProps)) {
      if (_.isEmpty(newProps) && _.isEmpty(props)) {
        return
      }
      _.each(getOnlyNewProps(newProps, props), (value, name) => {
        addPropertyToElement(tag, element, value, name, PUID)
      })
      //   addPropsToElement(
      //     element,
      //     getOnlyNewProps(newProps, props),
      //     oldPrometeyElement.uid
      //   )
      _.each(props, (prevPropValue, propName) => {
        const newPropValue = newProps[propName]
        if (_.isUndefined(newPropValue) || _.isNull(newPropValue)) {
          //   removePropFromElement(element, prevPropValue, propName)
          addPropertyToElement(tag, element, null, name, null, true)
          delete props[propName]
        } else {
          if (
            typeof newPropValue !== 'function' &&
            newPropValue !== prevPropValue
          ) {
            if (propName === 'value' && element.innerText !== newPropValue) {
              element.innerHTML = createDOMText(
                oldPrometeyElement.PUID,
                newPropValue
              )
              props[propName] = newPropValue
            } else {
              element.setAttribute(propName, newPropValue)
              props[propName] = newPropValue
            }
          }
        }
      })
    } else {
      if (_.isUndefined(newProps) || _.isNull(newProps) || !newProps.length) {
        prometeyElement.properties = addPrimitiveToElement(tag, element, '')
      } else if (newProps !== props) {
        prometeyElement.properties = addPrimitiveToElement(
          tag,
          element,
          newProps,
          oldPrometeyElement.PUID
        )
      }
    }
  }
}

const addPrimitiveToElement = (tag, element, value, PUID) => {
  if ((tag === 'input' || tag === 'textarea') && element.value !== value) {
    element.value = value
  } else if (tag === 'img') {
    element.src = value
  } else {
    element.innerHTML = value ? createDOMText(PUID, value) : value
  }
  return value
}
export const addPropertyToElement = (
  tag,
  element,
  value,
  name,
  PUID = 'puid',
  isRemove
) => {
  if (typeof name !== 'string') {
    console.error('Name of prop should have string type')
    name = `${name}`
  }
  if (typeof value === 'function') {
    element[name.toLowerCase()] = value
  } else {
    if (isRemove || !_.isUndefined(value)) {
      if (name === 'value') {
        addPrimitiveToElement(tag, element, isRemove ? '' : value, PUID)
      } else {
        if (isRemove) {
          element.removeAttribute(name)
        } else {
          element.setAttribute(name, value)
        }
      }
    }
  }
}

// const removePropertyFromElement = (tag, element, value, name) => {
//   if (typeof name !== 'string') {
//     console.error('Name of prop should have string type')
//     name = `${name}`
//   }
//   if (typeof value === 'function') {
//     element[name.toLowerCase()] = value
//   } else {
//     if (!_.isUndefined(value)) {
//       if (name === 'value') {
//         addPrimitiveToElement(tag, element, value)
//       } else {
//         element.setAttribute(name, value)
//       }
//     }
//   }
// }

export const getOnlyNewProps = (newProps, prevProps) =>
  prevProps
    ? _.reduce(
        newProps,
        (obj, value, key) => {
          if (prevProps[key] !== value) {
            obj[key] = value
          }
          // if (_.isUndefined(prevProps[key]) || _.isNull(prevProps[key])) {
          //   obj[key] = value
          // }
          return obj
        },
        {}
      )
    : newProps

/*

export const addPropsToElement = (element, props, uid) =>
  _.each(props, (prop, propName) => {
    if (typeof propName !== 'string') {
      throw new Error('Name of prop should have string type')
    }
    if (typeof prop === 'function') {
      console.log('ssss', propName, prop)
      element[propName.toLowerCase()] = prop
      // element.addEventListener(propName, prop)
      // element.addEventListener(propName, prop)
    } else {
      if (!_.isUndefined(prop)) {
        if (propName === 'value') {
          console.log('ГОВНО ', prop)
          element.innerHTML = `<!-- uid-${uid}-text --> ${prop} <!-- uid-${uid}-text -->`
          // element.innerText = prop
        } else {
          element.setAttribute(propName, prop)
        }
      }
    }
  })

*/
// const addPropertyToElement = (prevPropValue, propName) => {
//     const newPropValue = newProps[propName]
//     if (_.isUndefined(newPropValue) || _.isNull(newPropValue)) {
//       prevProps[propName] = removePropFromElement(
//         element,
//         prevPropValue,
//         propName
//       )
//     } else {
//       if (
//         typeof newPropValue !== 'function' &&
//         newPropValue !== prevPropValue
//       ) {
//         if (propName === 'value' && element.innerText !== newPropValue) {
//           element.innerHTML = createDOMText(
//             newPrometeyElement.PUID,
//             newPropValue
//           )
//           prevProps[propName] = newPropValue
//         } else {
//           element.setAttribute(propName, newPropValue)
//           prevProps[propName] = newPropValue
//         }
//       }
//     }
//   }
