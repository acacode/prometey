import _ from 'lodash'

let uid = 0
export const Prometey = (Class, props) => {
  let context = new Class()
  context.props = props
  context.__proto__.PROMETEY_ID = uid++ //eslint-disable-line
  // TODO: WILL DO IT
  context.setState = stateData => {
    const keys = Object.keys(stateData)
    let shouldUpdate = false
    if (keys.length) {
      keys.forEach(key => {
        if (!_.isEqual(stateData[key], context.state[key])) {
          shouldUpdate = true
          context.state[key] = stateData[key]
        }
      })
    }
    return shouldUpdate
  }
  if (context.rerenderTimer === undefined) {
    context.rerenderTimer = 10
    // context.rerenderTimer = 189
  }
  const rawRender = context.render.bind(context)
  context.render = () => rawRender()
  return context
}
