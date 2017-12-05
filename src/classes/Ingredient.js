// this class is not really needed, may add functions in future
class Ingredient {
  /**
   * Constructs a new ingredient
   * @param id
   * @param readable
   * @param texture
   * @param count
   * @param nbt
   */
  constructor (id, readable, texture, count, nbt) {
    this.id = id || ''
    this.readable = readable || ''
    this.texture = texture || ''
    this.count = count || 1
    this.nbt = nbt || '{}'
  }

  /**
   * Checks if the ingredient is populated
   * @returns {boolean}
   */
  isPopulated () {
    return this.id && this.readable && this.texture
  }

  /**
   * Gets a JSON object of the class
   * @returns {{id: (*|string), readable: (*|string), texture: (*|string), count: (*|number)}}
   */
  toJSON () {
    return {
      id: this.id,
      readable: this.readable,
      texture: this.texture,
      count: this.count
    }
  }
}

export default Ingredient
