import Ingredient from './Ingredient'

// oh hey look another useless class, mainly since I want to stay consistent...
class Tag extends Ingredient {
  /**
   * Constructs a new tag
   * @param id
   */
  constructor (id) {
    super(
      'This represents a custom tag.',
      'Tag',
      // name tag texture
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAPFBMVEX///8AAAB2RiPXu4c3KRBERETb29uLcF/mx4x0Qx8oHgvmx4z39/dERER6cWJ6b2A3KRDXu4fb29vmx4y4eCfgAAAADHRSTlMAAAAAAAAAAPcKAQDwrIIvAAAAnElEQVQ4T62Q7QrDIAxF47T2K13jfP93LddUZLAfSdmFIHgO0YTor5nnV8txfFpy9gpEHTNrPRWYpylnnBYhhIFDEFFM9EwQKQXXInjMI4QW4GXBdSkifgG41vNkVqF/1ioofrfUCuHGRkEx0vEY3SIAA6AUr6tH0PZQfrQ3Cv1rimP0C7qijmNMCau3CynpmN/YJ2ybtOz7wA7hAmA9HBXVF3gnAAAAAElFTkSuQmCC',
      1,
      '{}',
      false,
      {}
    ) // empty ingredient
    this.ingredient_type = 'tag'
    this.tag = id || ''
  }

  /**
   * Gets a JSON object of the class
   * @returns {{type: string, id: (*|string)}}
   */
  toJSON () {
    return {
      type: this.ingredient_type,
      id: this.tag
    }
  }
}

export default Tag
