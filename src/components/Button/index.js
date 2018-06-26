import { element } from '../../prometey'

let counter = 0
export default class Button {
  handleButtonClick = () => {
    console.log('clicked counter', counter++)
    this.props.onClick()
  }

  render() {
    const { label, useClick } = this.props
    return element('button.some-button', {
      value: label,
      [useClick ? 'click' : 'mousedown']: this.handleButtonClick,
    })
  }
}
