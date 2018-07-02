/**
 *  **** keywords ****
 *  pEl = Prometey element . structure is = { query: (string|class) , props: (any|array|string|object)}
 *  dEl = DOM element . structure is = { query: (same with pEl), element: DOM Element }
 *
 */

import _ from 'lodash'
import { classes } from './classes'
import { Prometey } from './Prometey'
import { updateElement, createDOMElement, createDOMElements } from './DOM'
// import {
//   removePropFromElement,
//   addPropsToElement,
//   getOnlyNewProps,
// } from './props'
// import { createDel, attachToDOM } from './DOM'

let prometeyObjects = {}
let prometeyComponents = {}

const convertStringToCharCodes = string =>
  _.join(_.map(string, c => c.charCodeAt()), '')

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
const parseQuery = (queryString, classNames) => {
  let [parent, query] = queryString.split('->')
  if (!query) {
    query = parent
    parent = null
  }
  const [element, ...className] = query.split('.')
  const [tag, id] = element.split('#')
  return {
    class: classes(className, classNames),
    id,
    parent,
    tag,
  }
}

const separateChilds = curProperties => {
  let childs = []
  let properties
  let isPrimitive = false
  // Проверяем свойства объекта, какой тип
  // Если тип Array - значит это массив дочерних прометей объектов
  if (_.isArray(curProperties)) {
    childs = [...curProperties]
  } else if (_.isObject(curProperties)) {
    // если это объект, значит это просто свойства
    if (!_.isEmpty(curProperties)) {
      // проверяем наличие ключа childs
      // если есть значит мы выносим детей в переменную childs
      // для дальнейшей обработки
      const propChilds = curProperties.childs
      if (propChilds && propChilds.length) {
        childs = [...propChilds]
      }
      // присваиваем свойства без ключей childs и class, так как эти свойства
      // уже используются сами по себе в прометей объекте
      // к примеру class уже есть у prometeyElement как свойство class
      // childs также
      properties = _.omit(curProperties, ['childs', 'class'])
    }
  } else {
    // Любой примитив присваиваем просто так
    properties = curProperties
    isPrimitive = true
  }

  return { childs, properties, isPrimitive }
}

function PrometeyElement(query, properties, childIndex, PUID) {
  return {
    query,
    ...parseQuery(query, _.get(properties, 'class')),
    childIndex,
    PUID,
    ...separateChilds(properties),
  }
}

/**
 * @name createPrometeyElement
 * @description Функция, которая парсит PrometeyObject и создает из него PrometeyElement
 *
 *
 * @param {PrometeyObject} prometeyObject - {query, properties}
 * @param {number} childIndex
 * @param {Object} component
 * @param {string} parentUID
 * @param {string} PUID
 *
 * @returns {PrometeyElement}
 */
const createPrometeyElement = (
  { query, properties },
  childIndex,
  component,
  parentUID,
  PUID
) => {
  // Создаем объект со всей необходимой информацией
  let prometeyElement = new PrometeyElement(query, properties, childIndex, PUID)
  // Рекурсивный вызов создания дочерних прометей объектов
  console.log('createPromeEl', PUID)
  if (prometeyElement.childs.length) {
    prometeyElement.childs = aggregatePrometeyObjectsTree(
      prometeyElement.childs,
      PUID
    )
  }
  // Если этот прометей объект завязан с компонентом, то добавляем
  // необходимое свойство 'component' для дальнейшей обработки
  if (component) {
    prometeyElement.component = {
      state: _.clone(component.state),
      render: component.render, // TODO: Проверить, возможно это не нужно
      props: _.clone(component.props),
      name: component.name,
    }
  }
  // Возвращаем
  // объект должен быть
  /*
  * {
  *   PUID: "/100105118_0/100105118_0"
  *   childIndex: 0
  *   childs:[{…}] //массив идентичных объектов
  *   class:"header main-page"
  *   id:undefined //из свойства quey div#id
  *   parent:null // создается исходя из parseQuery
  *               // с использованием -> , 
  *               // прим. body->div.wrapper, где
  *               // body это parent, именно строка
  *   isPrimitive: true,
  *   properties:{}
  *   query:"div.header"
  *   tag:"div",
  * } 
  */
  return prometeyElement
}

// const createPel = (data, index, component, parentUid) => {
//   const { query, props } = data
//   data = { ...parseQuery(query, _.get(props, 'class')) }
//   data.query = query
//   data.index = index
//   if (_.isArray(props)) {
//     data.childs = _.compact([...props])
//     data.props = undefined
//   } else if (_.isObject(props)) {
//     if (_.isEmpty(props)) {
//       data.props = undefined
//     }
//     const childs = props.childs
//     if (childs && childs.length) {
//       data.childs = _.compact([...childs])
//     }
//     data.props = _.omit(props, ['childs', 'class'])
//   } else {
//     data.props = props
//   }
//   data.uid = generateUid(data, index, parentUid)
//   if (data.childs) {
//     data.childs = createTree(data.childs, data.uid, data)
//   }
//   if (component) {
//     data.component = {
//       state: _.clone(component.state),
//       render: component.render,
//       props: _.clone(component.props),
//     }
//   }
//   return data
// }

// const removeRemovedChilds = (curDel, curChilds, newChilds) => {
//   const dElIndexes = []
//   // curDel.childs = []
//   // curDel.element.innerHTML = ''
//   _.forEach(
//     _.filter(
//       curChilds,
//       child => !_.find(newChilds, ch => compareChilds(child, ch))
//     ),
//     child => {
//       const parentHTML = _.get(child.element, 'parentElement.innerHTML', null)
//       if (curDel.element.innerHTML === parentHTML) {
//         curDel.element.removeChild(child.element)
//       } else if (parentHTML !== null) {
//         child.element.parentElement.removeChild(child.element)
//       }
//       dElIndexes.push(child.index)
//       child.element = null
//     }
//   )
//   _.forEach(dElIndexes, index => {
//     curDel.childs.splice(index, 1)
//   })
// }

// const compareChilds = (child, other) => other.uid === child.uid

// const addNewChilds = (curDel, curChilds, newChilds) => {
//   // _.forEach(newChilds, child => {
//   //   child.element = createDel(child)
//   //   if (child.childs && child.childs.length) {
//   //     attachToDOM(child.childs)
//   //     _.forEach(child.childs, subChild => {
//   //       console.log('subChild.element.innerHTML', subChild.element.innerHTML)
//   //       child.element.appendChild(subChild.element)
//   //     })
//   //   }
//   //   curDel.element.insertChildAtIndex(child.element, child.index)
//   //   curDel.childs.insert(child.index, child)
//   // })
//   _.forEach(
//     _.filter(
//       newChilds,
//       child => !_.find(curChilds, ch => compareChilds(child, ch))
//     ),
//     (child, index) => {
//       child.element = createDel(child)
//       if (child.childs && child.childs.length) {
//         attachToDOM(child.childs)
//         _.forEach(child.childs, subChild => {
//           console.log('subChild.element.innerHTML', subChild.element.innerHTML)
//           child.element.appendChild(subChild.element)
//         })
//       }
//       curDel.element.insertChildAtIndex(child.element, child.index)
//       curDel.childs.insert(child.index, child)
//     }
//   )
// }

// const compareDels = (curDel, newDel, component, parentDel) => {
//   if (curDel.query !== newDel.query) {
//     console.log(
//       'newDel.tag',
//       newDel.tag,
//       newDel.class,
//       newDel.tag !== curDel.tag
//     )
//     if (newDel.tag !== curDel.tag) {
//       parentDel.element.removeChild(curDel.element)
//       curDel.element = null
//       curDel.element = createDel(newDel)
//       parentDel.element.insertChildAtIndex(curDel.element, curDel.index)
//       curDel.tag = newDel.tag
//     } else {
//       console.log('aaaaaaaaaaaaaaaaaa!')
//     }
//     // curDel.element.innerText = ''
//     // TODO: !!!!!!!!
//     // if (
//     //   !_.isObject(curDel.props) &&
//     //   !_.isArray(curDel.props) &&
//     //   !_.isUndefined(curDel.props)
//     // ) {
//     //   curDel.element.innerHTML = curDel.element.innerHTML.replace(
//     //     `${curDel.props}`,
//     //     ''
//     //   )
//     // }
//     // console.log(
//     //   setTimeout(() => console.log(curDel.element.innerHTML), 0),
//     //   'ccurDel.element.children',
//     //   curDel.element.children,
//     //   curDel.childs
//     // )
//     curDel.query = newDel.query
//     // curDel.class = newDel.class
//     // curDel.id = newDel.id
//     // parentDel.childs.splice(curDel.index, 1)
//     // if (newDel.childs && child.childs.length) {
//     //   attachToDOM(child.childs)
//     //   _.forEach(child.childs, child =>
//     //     child.element.appendChild(child.element)
//     //   )
//     // }
//     // curDel.childs.insert(child.index, child)
//   }
//   if (curDel.class !== newDel.class) {
//     curDel.element.className = newDel.class
//     curDel.class = newDel.class
//   }
//   removeRemovedChilds(curDel, curDel.childs, newDel.childs)
//   addNewChilds(curDel, curDel.childs, newDel.childs)
//   if (_.isString(curDel.props) && !newDel.props) {
//     curDel.element.innerHTML = curDel.element.innerHTML.replace(
//       `<!-- uid-${curDel.uid}-text --> ${curDel.props} <!-- uid-${
//         curDel.uid
//       }-text -->`,
//       ''
//     )
//   }
//   if (!_.isEqual(curDel.props, newDel.props)) {
//     if (component && component.beforeRender) {
//       component.beforeRender()
//     }
//     const element = curDel.element
//     const newProps = newDel.props
//     const prevProps = curDel.props
//     if (_.isObject(newDel.props)) {
//       if (!_.isEmpty(newProps) && !_.isEmpty(prevProps)) {
//         addPropsToElement(element, getOnlyNewProps(newProps, prevProps))
//         _.each(prevProps, (prevPropValue, propName) => {
//           const newPropValue = newProps[propName]
//           if (_.isUndefined(newPropValue) || _.isNull(newPropValue)) {
//             prevProps[propName] = removePropFromElement(
//               element,
//               prevPropValue,
//               propName
//             )
//           } else {
//             if (typeof newPropValue === 'function') {
//               element[propName.toLowerCase()] = newPropValue
//             } else if (newPropValue !== prevPropValue) {
//               if (propName === 'value' && element.innerText !== newPropValue) {
//                 prevProps[propName] = element.innerText = newPropValue
//               } else {
//                 element.setAttribute(propName, newPropValue)
//                 prevProps[propName] = newPropValue
//               }
//             }
//           }
//         })
//       } else if (!_.isEmpty(newProps) && _.isEmpty(prevProps)) {
//         addPropsToElement(element, getOnlyNewProps(newProps, prevProps))
//         curDel.props = { ...newProps }
//       }
//     } else {
//       const noChilds = !_.get(newDel.childs, 'length')
//       const newValue = newProps
//       const { tag } = newDel
//       if (_.isUndefined(newValue) || _.isNull(newValue) || !newValue.length) {
//         if (
//           (tag === 'input' || tag === 'textarea') &&
//           element.value !== newValue
//         ) {
//           element.value = ''
//         } else if (tag === 'img') {
//           element.src = ''
//         } else if (noChilds) {
//           element.innerHTML = ''
//         }
//         if (curDel && noChilds) {
//           curDel.props = ''
//         }
//       } else {
//         if (
//           (tag === 'input' || tag === 'textarea') &&
//           element.value !== newValue
//         ) {
//           element.value = newValue
//         } else if (tag === 'img') {
//           element.src = newValue
//         } else {
//           element.innerHTML = `<!-- uid-${
//             newDel.uid
//           }-text --> ${newValue} <!-- uid-${newDel.uid}-text -->`
//         }
//         if (curDel) {
//           curDel.props = newValue
//         }
//       }
//     }
//     if (component && component.postRender) {
//       component.postRender()
//     }
//   }
//   if (curDel.childs) {
//     const removeChild = (child, index) => {
//       if (child.element !== null) {
//         curDel.element.removeChild(child.element)
//         child.element = null
//       }
//       curDel.childs.splice(index, 1)
//     }
//     for (let x = 0; x < curDel.childs.length; x++) {
//       const curDelChild = curDel.childs[x]
//       if (newDel.childs === undefined) {
//         removeChild(curDelChild, x)
//       } else {
//         if (newDel.childs[x] === undefined) {
//           removeChild(curDelChild, x)
//         } else {
//           if (
//             curDelChild.component &&
//             (newDel.childs[x] && newDel.childs[x].component)
//           ) {
//             if (newDel.childs[x].query !== curDelChild.query) {
//               const newDelChild = newDel.childs[x]
//               compareDels(
//                 curDelChild,
//                 createPel(
//                   newDelChild.component.render(),
//                   newDelChild.index,
//                   newDelChild.component,
//                   curDel.uid
//                 ),
//                 newDelChild.component,
//                 curDel
//               )
//             } else {
//               updateComponent(
//                 curDelChild,
//                 newDel.childs[x].component,
//                 curDel.uid,
//                 curDel
//               )
//             }
//           } else {
//             compareDels(curDelChild, newDel.childs[x], null, curDel)
//           }
//         }
//       }
//     }
//   }
// }

// const createComponentWatcher = (del, component, parentUid, parentDel) => {
//   let updaterTimer = null

//   const rawUpdate = component.setState

//   component.setState = stateData => {
//     const shouldUpdate = rawUpdate(stateData)
//     if (shouldUpdate) {
//       clearTimeout(updaterTimer)
//       updaterTimer = setTimeout(() => {
//         updaterTimer = null
//         updateComponent(del, component, parentUid, parentDel)
//       }, component.rerenderTimer)
//     }
//   }
// }

// const convertPelToDel = (pEl, index, parentUid, parentDel) => {
//   const { query, props } = pEl
//   let del
//   if (_.isObject(query)) {
//     const component = Prometey(query, props)
//     let componentPEl = component.render()
//     del = createPel(componentPEl, index, component, parentUid)
//     createComponentWatcher(del, component, parentUid, parentDel)
//   } else {
//     del = createPel(pEl, index, null, parentUid)
//   }
//   return del
// }

// const generateUid = (pEl, index, parentUid) => {
//   return `${_.last(_.chunk(parentUid, 10)).join('')}${pEl.tag}${index}`
// }

// export const createTree = (pEls, parentUid = 'zero', parentDel) => {
//   let dEls
//   if (_.isArray(pEls)) {
//     dEls = _.map(pEls, (pEl, index) => {
//       return convertPelToDel(pEl, index, parentUid, parentDel)
//     })
//   } else {
//     dEls = [convertPelToDel(pEls, 0, parentUid, parentDel)]
//   }
//   return dEls
// }

export const generatePUID = (prometeyObject, childIndex, parentUID) => {
  return `${_.last(_.chunk(parentUID, 30)).join('')}/${convertStringToCharCodes(
    prometeyObject.tag || prometeyObject.name
  )}_${childIndex}`
}

// createTree
export const aggregatePrometeyObjectsTree = (tree, parentUID) => {
  if (parentUID === undefined) {
    parentUID = convertStringToCharCodes('creator')
    prometeyObjects[parentUID] = { isRoot: true }
  }
  if (_.isArray(tree)) {
    return _.map(tree, (prometeyObject, index) =>
      attachElementToPrometeyObject(prometeyObject, index, parentUID)
    )
  }
  return [attachElementToPrometeyObject(tree, 0, parentUID)]
}

// createElement
export const createPrometeyObject = (query, properties) => {
  const isComponent = typeof query !== 'string'
  return {
    query,
    properties,
    isComponent,
  }
}

// convertPelToDel
const attachElementToPrometeyObject = (
  prometeyObject,
  childIndex,
  parentUID
) => {
  if (!prometeyObject) {
    return {
      isNegative: true,
      childIndex,
      query: prometeyObject,
    }
  }
  // let prometeyObjectWithElement = null
  if (prometeyObject.isComponent) {
    const PUID = generatePUID(prometeyObject.query, childIndex, parentUID)
    const existComponent = prometeyComponents[PUID]
    if (existComponent) {
      return existComponent
    } else {
      const component = Prometey(prometeyObject)
      const prometeyElement = createPrometeyElement(
        component.render(), // render() returns prometeyObject
        childIndex,
        component,
        parentUID,
        PUID
      )
      prometeyComponents[PUID] = prometeyElement
      attachWatcherForComponentState(component, prometeyElement, parentUID)
      return prometeyElement
    }
  } else {
    const parsedQuery = parseQuery(prometeyObject.query)
    const PUID = generatePUID(parsedQuery, childIndex, parentUID)
    const existPrometeyObject = prometeyObjects[PUID]
    if (existPrometeyObject) {
      return existPrometeyObject
    } else {
      const prometeyElement = createPrometeyElement(
        prometeyObject,
        childIndex,
        null,
        parentUID,
        PUID
      )
      prometeyObjects[PUID] = prometeyElement
      return prometeyElement
    }
  }
}

const attachWatcherForComponentState = (
  component,
  prometeyElement,
  parentUID
) => {
  let updateTimer = null

  const rawUpdate = component.setState

  component.setState = stateData => {
    const shouldUpdate = rawUpdate(stateData)
    if (shouldUpdate) {
      clearTimeout(updateTimer)
      updateTimer = setTimeout(() => {
        updateTimer = null
        console.log('update timer fired')
        updateComponent(prometeyElement, component, parentUID) // TODO
      }, component.rerenderTimer)
    }
  }
}

const updateComponent = (prometeyElement, component, parentUID) => {
  // Сравниваем новой состояние со старым
  const stateUpdated = !_.isEqual(
    prometeyElement.component.state,
    component.state
  )
  // Сравниваем новые свойства со старыми
  const propsUpdated = !_.isEqual(
    prometeyElement.component.props,
    component.props
  )
  if (stateUpdated) {
    // Обновляем предыдущеее состояние текущего компонента
    prometeyElement.component.state = _.clone(component.state)
  }
  if (propsUpdated) {
    // Обновляем предыдущие свойства текущего компонента
    prometeyElement.component.props = _.clone(component.props)
  }

  if (stateUpdated || propsUpdated) {
    // const updatedPrometeyObject = attachElementToPrometeyObject(
    //   {
    //     query: {
    //       name: prometeyElement.component.name,
    //     },
    //     isComponent: true,
    //   },
    //   prometeyElement.childIndex,
    //   parentUID
    // )
    updatePrometeyObject(prometeyElement, component.render(), parentUID)
    // console.log('updatedPrometeyObject', updatedPrometeyObject)
    // compareDels(dEl, newDel, component)
  }
}

const findElementByPUID = PUID =>
  prometeyObjects[PUID] || prometeyComponents[PUID]

const updatePrometeyObject = (prometeyElement, prometeyObject, parentUID) => {
  const { childs, properties, isPrimitive } = separateChilds(
    prometeyObject.properties
  )
  console.log(
    'prometeyElement',
    prometeyElement,
    'prometeyObject',
    prometeyObject,
    childs,
    properties,
    isPrimitive
  )
  if (prometeyElement.childs.length === childs.length) {
    for (let x = 0; x < prometeyElement.childs.length; x++) {
      const currentChild = prometeyElement.childs[x]
      const newChild = childs[x]
      if (currentChild.isNegative && !newChild.isNegative) {
        // нужно добавить новый элемент
        const updatedCurrentChild = (prometeyElement.childs[
          x
        ] = attachElementToPrometeyObject(
          newChild,
          currentChild.childIndex,
          prometeyElement.PUID
        ))
        console.log('findElementByPUID', findElementByPUID(parentUID))
        updatedCurrentChild.element = createDOMElement(updatedCurrentChild)
        if (updatedCurrentChild.childs && updatedCurrentChild.childs.length) {
          createDOMElements(updatedCurrentChild.childs)
          _.forEach(updatedCurrentChild.childs, child => {
            if (!child.isNegative) {
              updatedCurrentChild.element.appendChild(child.element)
            }
          })
        }
      } else if (!currentChild.isNegative && newChild.isNegative) {
        // нужно удалить старый элемент
      } else {
        // нужно обновить
        updateElement(
          currentChild.tag,
          currentChild.element,
          currentChild,
          new PrometeyElement(
            newChild.query,
            newChild.properties,
            currentChild.childIndex,
            currentChild.PUID
          )
        )
      }
    }
    // _.forEach(prometeyElement.childs, (currentChild, index) => {})
  }
}
