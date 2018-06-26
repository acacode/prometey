import { element } from '../../prometey'

let counter = 0
export default class Button {
  handleButtonClick = e => {
    console.log(e)
    console.log('clicked counter', counter++)
    this.props.onClick()
  }

  render() {
    const { label, useClick } = this.props
    return element('button.some-button', {
      value: label,
      [useClick ? 'onClick' : 'onMouseDown']: this.handleButtonClick,
    })
  }
}
