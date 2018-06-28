import { element } from '../../prometey'

export default class Button {
  init(props) {
    console.log('INIT EBAT', props)
  }

  handleButtonClick = e => {
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
