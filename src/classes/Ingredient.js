// this class is not really needed, may add functions in future
class Ingredient {
  /**
   * Contructs a new ingredient
   * @param id
   * @param readable
   * @param texture
   */
  constructor (id, readable, texture) {
    this.id = id || ''
    this.readable = readable || ''
    this.texture = texture || ''
  }

  /**
   * Checks if the ingredient is populated
   * @returns {*|string}
   */
  isPopulated() {
    return this.id && this.readable && this.texture
  }
}

export default Ingredient
