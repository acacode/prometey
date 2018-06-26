let uid = 0
export const Prometey = (Class, props) => {
  let context = new Class()
  context.props = props
  context.__proto__.PROMETEY_ID = uid++ //eslint-disable-line
  // TODO: WILL DO IT
  // context.setState = newState => {
  //   const keys = Object.keys(newState)
  //   if (keys.length) {
  //     keys.forEach(key => {
  //       if (newState[key] !== context.state[key]) {
  //         context.state[key] = newState[key]
  //       }
  //     })
  //   }
  // }
  if (context.rerenderTimer === undefined) {
    context.rerenderTimer = 10
    // context.rerenderTimer = 189
  }
  const rawRender = context.render.bind(context)
  context.render = () => rawRender()
  return context
}
