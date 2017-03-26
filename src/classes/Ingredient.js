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
   * Updates ingredient
   * @param id
   * @param readable
   * @param texture
   */
  update(id, readable, texture) {
    this.id = id
    this.readable = readable
    this.texture = texture
  }

  /**
   * Resets ingredient
   */
  reset() {
    this.id = ''
    this.readable = ''
    this.texture = ''
  }
}

export default Ingredient
