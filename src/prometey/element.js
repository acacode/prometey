import _ from 'lodash'
import { classes } from './classes'
import { Prometey } from './Prometey'
import { createDel, attachToDOM } from './DOM'

/**
 *  **** keywords ****
 *  pEl = Prometey element . structure is = { query: (string|class) , props: (any|array|string|object)}
 *  dEl = DOM element . structure is = { query: (same with pEl), element: DOM Element }
 *
 */

export const parseQuery = (queryString, classNames) => {
  let [parent, query] = queryString.split('->')
  if (!query) {
    query = parent
    parent = null
  }
  const [element, ...className] = query.split('.')
  const [tag, id] = element.split('#')
  return {
    class: classes(_.split(className, ' '), _.split(classNames, ' ')),
    id,
    parent,
    tag,
  }
}

// const generateElId = (pId, id) => `${pId}${id}`

// const attachElementToTree = (treeData, eId) => {
//   let treeEl = { ...treeData }
//   if (!eId) {
//     eId = `${JSDOMTree.push(treeEl) - 1}`
//   }
//   treeEl.eId = eId
//   if (treeData.childs) {
//     treeEl.childs = createTree(treeData.childs, eId)
//   }
//   return treeEl
// }

// const removeExistChilds = (childs, anotherChilds) => {
//   return _.reduce(
//     childs,
//     (arr, child) => {
//       if (_.find(anotherChilds, aC => aC.eId !== child.eId).length) {
//         arr.push(child)
//       }
//       return arr
//     },
//     []
//   )
// }

// /*

// oldTD = { childs: [ {data with eId} ... ]}
// newTD = { childs: [ {onlyData} ...]}
// */
// const updateElement = (oldTD, newTD) => {
//   if (!oldTD) {
//     console.log('sss')
//   }
//   const treeDOMel = getElementByEId(oldTD.eId)
//   if (newTD.class !== oldTD.class) {
//     treeDOMel.element.className = newTD.class
//     oldTD.class = newTD.class
//   }
//   updateElementByProps(newTD.tag, treeDOMel.element, newTD, oldTD)
//   if (newTD.childs) {
//     const oldChildsCount = _.get(oldTD, 'childs.length')
//     const newChildsCount = _.get(newTD, 'childs.length')
//     if (oldChildsCount !== newChildsCount) {
//       if (newChildsCount > oldChildsCount) {
//         _.each(newTD.childs, (child, index) => {
//           console.log('new child', child)
//           if (!oldTD.childs[index] || child.tag !== oldTD.childs[index].tag) {
//             oldTD.childs[index] = aggregateTreeData(
//               child,
//               `${index}`,
//               oldTD.eId
//             )
//           }
//         })
//       } else {
//         _.each(removeExistChilds(oldTD.childs, newTD.childs), child => {
//           console.log('remove child', child)
//         })
//       }
//     }
//     _.each(newTD.childs, (child, index) =>
//       updateElement(oldTD.childs[index], child)
//     )
//   }
// }

// const aggregateTreeData = (treeData, id, pId) => {
//   const eId = pId && id && generateElId(pId, id)
//   const treeEl = attachElementToTree(treeData, eId)
//   if (treeEl.component) {
//     let updaterTimer = null
//     _.forEach(treeEl.component.state, (value, key) => {
//       treeEl.component.state.watch(key, (key, value) => {
//         if (updaterTimer !== null) {
//           clearTimeout(updaterTimer)
//         }
//         updaterTimer = setTimeout(() => {
//           updaterTimer = null
//           updateElement(treeEl, treeEl.component.render())
//         }, 0)
//       })
//     })
//   }
//   return treeEl
// }

// export const createTree = (treeData, pId) => {
//   let data
//   if (_.isArray(treeData)) {
//     data = _.map(treeData, (element, id) =>
//       aggregateTreeData(element, `${id}`, pId)
//     )
//   } else {
//     data = [aggregateTreeData(treeData)]
//   }
//   return data
// }

const createPel = (data, index, component) => {
  const { query, props } = data
  data = { ...parseQuery(query, _.get(props, 'class')) }
  data.query = query
  data.index = index
  if (_.isArray(props)) {
    data.childs = _.compact([...props])
    data.props = undefined
  } else if (_.isObject(props)) {
    if (_.isEmpty(props)) {
      data.props = undefined
    }
    const childs = props.childs
    if (childs && childs.length) {
      data.childs = _.compact([...childs])
    }
    data.props = _.omit(props, ['childs', 'class'])
  } else {
    data.props = props
  }
  if (data.childs) {
    data.childs = createTree(data.childs)
  }
  if (component) {
    data.component = {
      state: _.clone(component.state),
      render: component.render,
      props: _.clone(component.props),
    }
  }
  return data
}

const removeRemovedChilds = (curDel, curChilds, newChilds) => {
  const dElIndexes = []

  _.forEach(
    _.filter(
      curChilds,
      child => !_.find(newChilds, ch => ch.query === child.query)
    ),
    (child, index) => {
      curDel.element.removeChild(child.element)
      child.element = null
      dElIndexes.push(index)
    }
  )
  _.forEach(dElIndexes, index => {
    curDel.childs.splice(index, 1)
  })
}

const addNewChilds = (curDel, curChilds, newChilds) => {
  _.forEach(
    _.filter(
      newChilds,
      child => !_.find(curChilds, ch => ch.query === child.query)
    ),
    (child, index) => {
      child.element = createDel(child)
      if (child.childs && child.childs.length) {
        attachToDOM(child.childs)
        _.forEach(child.childs, child =>
          child.element.appendChild(child.element)
        )
      }
      curDel.element.insertChildAtIndex(child.element, index)
      curDel.childs.insert(index, child)
    }
  )
}

const compareDels = (curDel, newDel) => {
  if (curDel.query === newDel.query) {
    if (curDel.class !== newDel.class) {
      curDel.element.className = newDel.class
      curDel.class = newDel.class
    }
    removeRemovedChilds(curDel, curDel.childs, newDel.childs)
    addNewChilds(curDel, curDel.childs, newDel.childs)
    if (!_.isEqual(curDel.props, newDel.props)) {
      console.log('diffe')
    }
    _.forEach(curDel.childs, (curDelChild, index) => {
      if (curDelChild.component || newDel.childs[index].component) {
        updateComponent(curDelChild, newDel.childs[index].component)
      } else {
        compareDels(curDelChild, newDel.childs[index])
      }
    })
  }
}

const updateComponent = (dEl, component) => {
  // console.log(dEl, component)
  console.log('dEl.component.props', dEl.component.props)
  const stateUpdated = !_.isEqual(dEl.component.state, component.state)
  const propsUpdated = !_.isEqual(dEl.component.props, component.props)
  if (stateUpdated) {
    dEl.component.state = _.clone(component.state)
  }
  if (propsUpdated) {
    dEl.component.props = _.clone(component.props)
  }

  if (stateUpdated || propsUpdated) {
    const newDel = createPel(component.render(), dEl.index, component)
    compareDels(dEl, newDel)
  }
}

let counter = 0
const createComponentWatcher = (del, component) => {
  let updaterTimer = null
  _.forEach(component.state, (value, key) => {
    component.state.watch(key, (key, value) => {
      clearTimeout(updaterTimer)
      updaterTimer = setTimeout(() => {
        updaterTimer = null
        console.log('rerender ', counter++)
        updateComponent(del, component)
      }, component.rerenderTimer)
    })
  })
}

const convertPelToDel = (pEl, index) => {
  const { query, props } = pEl
  let del
  if (_.isObject(query)) {
    const component = Prometey(query, props)
    let componentPEl = component.render()
    del = createPel(componentPEl, index, component)
    createComponentWatcher(del, component)
  } else {
    del = createPel(pEl, index)
  }
  // if (treeEl.component) {
  //   let updaterTimer = null
  //   _.forEach(treeEl.component.state, (value, key) => {
  //     treeEl.component.state.watch(key, (key, value) => {
  //       if (updaterTimer !== null) {
  //         clearTimeout(updaterTimer)
  //       }
  //       updaterTimer = setTimeout(() => {
  //         updaterTimer = null
  //         updateElement(treeEl, treeEl.component.render())
  //       }, 0)
  //     })
  //   })
  // }
  return del
}

export const createTree = pEls => {
  console.log('pEls', pEls)
  let dEls
  if (_.isArray(pEls)) {
    dEls = _.map(pEls, convertPelToDel)
  } else {
    dEls = [convertPelToDel(pEls, 0)]
  }
  return dEls
}

export const createElement = (query, props) => {
  // TODO: Не нужно генерить элемент, просто возвращать то что получил, а методы
  // такие как render или Prometey.connect сами сделают все что нужно
  return {
    query,
    props,
  }
  // if (_.isObject(query)) {
  //   const component = Prometey(query, props)
  //   let componentTreeData = component.render()
  //   componentTreeData.component = component
  //   return componentTreeData
  // }

  // let data = { ...parseQuery(query, _.get(props, 'class')) }
  // if (_.isArray(props)) {
  //   data.childs = _.compact([...props])
  // } else if (_.isObject(props)) {
  //   const childs = props.childs
  //   if (childs && childs.length) {
  //     data.childs = _.compact([...childs])
  //   }
  //   data.props = _.omit(props, ['childs', 'class'])
  // } else {
  //   data.props = props
  // }
  // return data
}
