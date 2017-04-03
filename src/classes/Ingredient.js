// this class is not really needed, may add functions in future
class Ingredient {
  /**
   * Contructs a new ingredient
   * @param id
   * @param readable
   * @param texture
   * @param count
   */
  constructor (id, readable, texture, count) {
    this.id = id || ''
    this.readable = readable || ''
    this.texture = texture || ''
    this.count = count || 1
  }

  /**
   * Checks if the ingredient is populated
   * @returns {*|string}
   */
  isPopulated() {
    return this.id && this.readable && this.texture
  }

  /**
   * Gets a JSON object of the class
   * @returns {{id: (*|string), readable: (*|string), texture: (*|string), count: (*|number)}}
   */
  toJSON() {
    return {
      id: this.id,
      readable: this.readable,
      texture: this.texture,
      count: this.count
    }
  }
}

export default Ingredient
