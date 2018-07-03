import _ from 'lodash'

export const Prometey = ({ query: Component, props = {} }) => {
  let context = new Component(props)
  context.props = props
  context.__proto__.name = Component.name //eslint-disable-line
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
  }
  const rawRender = context.render.bind(context)
  context.render = () => rawRender()
  return context
}
