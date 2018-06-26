import { element } from '../../prometey'

let counter = 0
export default class Button {
  render() {
    const { label, onClick } = this.props
    return element('button.some-button', {
      value: label,
      click: () => {
        console.log('clicked counter', counter++)
        onClick()
      },
    })
  }
}
