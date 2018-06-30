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

export const removePropFromElement = (element, prop, name) => {
  const tag = element.tagName.toLowerCase()
  if (typeof prop === 'function') {
    element[name.toLowerCase()] = null
  } else if (name === 'value') {
    if ((tag === 'input' || tag === 'textarea') && element.value !== '') {
      element.value = ''
    } else if (tag === 'img') {
      element.src = ''
    } else {
      element.innerHTML = ''
    }
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
    addPropsToElement(element, getOnlyNewProps(newProps, prevProps), newTD.uid)
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
            element.innerHTML = `<!-- uid-${
              newTD.uid
            }-text --> ${newPropValue} <!-- uid-${newTD.uid}-text -->`
            prevProps[propName] = newPropValue
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
      } else {
        element.innerHTML = ''
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
        element.innerHTML = `<!-- uid-${
          newTD.uid
        }-text --> ${newProps} <!-- uid-${newTD.uid}-text -->`
      }
      if (oldTD) {
        oldTD.props = newProps
      }
    }
  }
}
