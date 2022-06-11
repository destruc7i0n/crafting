export const NoTextureTexture =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAt1BMVEX/AP//AP//AP/9AP0fAB8AAAABAAEAAAD/AP/9AP0fAB8BAAH/AP/+AP4YABgBAAH/AP/+AP4WABYBAAH+AP4XABcBAAH+AP4XABf/AP//AP/+AP4YABgBAAEAAAD/AP/+AP4ZABkDAAP+AP4SABL+AP4UABT+AP7+AP7+AP7+AP7+AP70APRXAFcUABQYABgXABcXABcXABceAB4VABUXABcSABJYAFj0APT+AP7+AP7+AP79AP2J1Tm8AAAAAWJLR0QF+G/pxwAAAAd0SU1FB+EJDhcOFGEzO8MAAAAJdnBBZwAAACIAAAAiAPgEXxQAAADzSURBVDjL1dDZkoIwEAXQy3IBBQVFUVHcd8d9G5f//64pCy0yqQrv3n5LnaTTDWTRdMAwSctmFojAAQpF0lUCDyiVSV8JAqBSJcM8UKuTUR5oNL8SaFlaMdDukEnXzgLd8YJ34h7QH5DDJEoT+q4FKaMx/0cGk6kMjMKsMm8sXtVejlY/681429k1X7WvHoomzGP5VE8PzoPL9Po7ufXv6YXao/Q0IL24WclNJXC5ycBy/fA9VTIkt0ugF38G9xwdwk66CXm+A3FL2J7Ywo7I3QIINMUfvgbs53kgJE+PPOCThxngKYFLHp+AowQWaRqALoI/Q50gLzlZBxIAAAAldEVYdGRhdGU6Y3JlYXRlADIwMTctMDktMTVUMDE6MTQ6MjArMDI6MDDBw4POAAAAJXRFWHRkYXRlOm1vZGlmeQAyMDE3LTA5LTE1VDAxOjE0OjIwKzAyOjAwsJ47cgAAAABJRU5ErkJggg=='

class Ingredient {
  /**
   * Constructs a new ingredient
   * @param id
   * @param readable
   * @param texture
   * @param count
   * @param nbt
   * @param custom
   * @param customData
   * @param isBedrock
   */
  constructor (id, readable, texture, count, nbt, custom, customData, isBedrock) {
    this.ingredient_type = 'item'
    this.id = id || ''
    this.readable = readable || ''
    this.textureSrc = texture || ''
    this.count = count || 1
    this.nbt = nbt || '{}'
    this.custom = custom || false
    this.customData = customData || {}
    this.isBedrock = isBedrock
  }

  get texture () {
    if (this.custom && !this.textureSrc) {
      return NoTextureTexture
    } else {
      return this.textureSrc
    }
  }

  fullId () {
    return this.isBedrock ? this.idWithData() : this.id
  }

  idWithData () {
    const { data } = this.customData
    let idString = this.id
    if (data) idString += `:${data}`
    return idString
  }

  /**
   * Checks if the ingredient is populated
   * @returns {boolean}
   */
  isPopulated () {
    return this.id && this.readable && (this.custom || this.textureSrc)
  }

  /**
   * Whether this ingredient has custom data
   * @returns {boolean}
   */
  hasCustomData () {
    return Object.keys(this.customData).length > 0
  }

  /**
   * Gets the custom data for the ingredient
   * @returns {*|{}}
   */
  getCustomData () {
    return this.customData
  }

  /**
   * Get the custom data of this object as a sorted string
   * @returns {string}
   */
  getCustomDataAsString () {
    // sort the custom data
    const sortedData = Object.keys(this.customData).sort().map(k => `${k}:${this.customData[k]}`)
    return sortedData.join(':')
  }

  /**
   * Get a comparable string with the id and/or custom data
   * @returns {string}
   */
  getComparableString () {
    return this.id + (this.hasCustomData() ? `:${this.getCustomDataAsString()}` : '')
  }

  /**
   * Gets a JSON object of the class
   * @returns {{type: string, id: (*|string), readable: (*|string), texture: (*|string), count: (*|number)}}
   */
  toJSON () {
    return {
      type: this.ingredient_type,
      id: this.id,
      readable: this.readable,
      texture: this.textureSrc,
      count: this.count,
      custom: this.custom,
      customData: this.customData
    }
  }

  /**
   * Clones the ingredient
   * @returns {Ingredient}
   */
  clone () {
    return new Ingredient(
      this.id,
      this.readable,
      this.textureSrc,
      this.count,
      this.nbt,
      this.custom,
      this.customData
    )
  }
}

export default Ingredient
