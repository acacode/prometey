import _ from 'lodash'
// import { updateElementByProps } from './props'

export const createDOMElements = prometeyElements => {
  _.each(prometeyElements, prometeyElement => {
    prometeyElement.element = createDOMElement(prometeyElement)
    if (prometeyElement.childs && prometeyElement.childs.length) {
      createDOMElements(prometeyElement.childs)
      _.forEach(prometeyElement.childs, child =>
        prometeyElement.element.appendChild(child.element)
      )
    }
  })
}
export const createDOMElement = prometeyElement => {
  const { tag, id, parent, properties } = prometeyElement

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
  let props = prometeyElement && prometeyElement.properties
  if (!oldPrometeyElement) {
    if (_.isObject(props)) {
      _.forEach(props, (value, name) => {
        addPropertyToElement(tag, element, value, name, prometeyElement.PUID)
      })
    } else {
      addPrimitiveToElement(tag, element, props, prometeyElement.PUID)
    }
  } else {
    let newProps = oldPrometeyElement.props
    //   const noChilds = !_.get(oldPrometeyElement.childs, 'length')

    if (_.isObject(newProps)) {
      if (_.isEmpty(newProps) && _.isEmpty(props)) {
        return
      }
      addPropsToElement(
        element,
        getOnlyNewProps(newProps, props),
        oldPrometeyElement.uid
      )
      _.each(props, (prevPropValue, propName) => {
        const newPropValue = newProps[propName]
        if (_.isUndefined(newPropValue) || _.isNull(newPropValue)) {
          props[propName] = removePropFromElement(
            element,
            prevPropValue,
            propName
          )
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
const addPropertyToElement = (tag, element, value, name, PUID) => {
  if (typeof name !== 'string') {
    console.error('Name of prop should have string type')
    name = `${name}`
  }
  if (typeof value === 'function') {
    element[name.toLowerCase()] = value
  } else {
    if (!_.isUndefined(value)) {
      if (name === 'value') {
        addPrimitiveToElement(tag, element, value, PUID)
      } else {
        element.setAttribute(name, value)
      }
    }
  }
}
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
