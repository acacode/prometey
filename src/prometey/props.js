import _ from 'lodash'

export const getOnlyNewProps = (newProps, prevProps) =>
  prevProps
    ? _.reduce(
        newProps,
        (obj, value, key) => {
          if (_.isUndefined(prevProps[key]) || _.isNull(prevProps[key])) {
            obj[key] = value
          }
          return obj
        },
        {}
      )
    : newProps

export const addPropsToElement = (element, props) =>
  _.each(props, (prop, propName) => {
    if (typeof propName !== 'string') {
      throw new Error('Name of prop should have string type')
    }
    if (typeof prop === 'function') {
      element[propName.toLowerCase()] = prop
      // element.addEventListener(propName, prop)
      // element.addEventListener(propName, prop)
    } else {
      if (!_.isUndefined(prop)) {
        if (propName === 'value') {
          element.innerText = prop
        } else {
          element.setAttribute(propName, prop)
        }
      }
    }
  })

export const removePropFromElement = (element, prop, name) => {
  if (typeof prop === 'function') {
    element[name.toLowerCase()] = null
  } else if (name === 'value') {
    element.innerText = ''
  } else {
    element.removeAttribute(name)
  }
}

export const updateElementByProps = (tag, element, newTD, oldTD) => {
  let newProps = newTD.props
  let prevProps = oldTD && oldTD.props
  const noChilds = !_.get(newTD.childs, 'length')

  if (_.isObject(newProps)) {
    if (_.isEmpty(newProps) && _.isEmpty(prevProps)) {
      return
    }
    addPropsToElement(element, getOnlyNewProps(newProps, prevProps))
    _.each(prevProps, (prevPropValue, propName) => {
      const newPropValue = newProps[propName]
      if (_.isUndefined(newPropValue) || _.isNull(newPropValue)) {
        prevProps[propName] = removePropFromElement(
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
            prevProps[propName] = element.innerText = newPropValue
          } else {
            element.setAttribute(propName, newPropValue)
            prevProps[propName] = newPropValue
          }
        }
      }
    })
  } else {
    if (_.isUndefined(newProps) || _.isNull(newProps) || !newProps.length) {
      if (
        (tag === 'input' || tag === 'textarea') &&
        element.value !== newProps
      ) {
        element.value = ''
      } else if (tag === 'img') {
        element.src = ''
      } else if (noChilds) {
        element.innerText = ''
      }
      if (oldTD && noChilds) {
        oldTD.props = ''
      }
    } else if (newProps !== prevProps) {
      if (
        (tag === 'input' || tag === 'textarea') &&
        element.value !== newProps
      ) {
        element.value = newProps
      } else if (tag === 'img') {
        element.src = newProps
      } else {
        element.innerText = newProps
      }
      if (oldTD) {
        oldTD.props = newProps
      }
    }
  }
}
