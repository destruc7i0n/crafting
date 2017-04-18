import CraftingGenerator from '../../src/classes/CraftingGenerator'

import Ingredient from '../../src/classes/Ingredient'

describe('Crafting Generator Class', () => {
  const dirt = {
    'readable': 'Dirt',
    'id': 'minecraft:dirt',
    'texture': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAPFBMVEUAAABaPytMNiWWbEpvUDc9Kx15VTpdQy4tHxWJY0RCLR5ZPSm5hVxkZGQ2NjZERERsbGxQUFCHh4dWQTLaRhl8AAAAAXRSTlMAQObYZgAAAXdJREFUOI2VUtduwzAMDJe2s/r//9o7yW4CJGlRPliAebxB6XT6Xw0z+6Vt12tifZru3Sylkez+jmW2kiXroOgvLJDG/ACq98QDXE9t/k1jpE6a0UnAGg9y/rGR2IMEkDDb4WlBqg8bE2A0ALVBG5iLPAHiLmScymOknX9ELmUxSJPqtisRhHGLEppjAvyG/uayIoDonkwjaxTdAegLWKRNFcTIWiJAUBZAxBvaFbBKBQ29kOCsZZmszdtiERxrmt8zSHYAO8zSUAFtQACABT08bOj5lJEcGRhkyDx3AKfJw1PPCv6CLmMsAGYBqgQ0Aa8yJARy7AwzJCQIEXZY+CLMIcFlkh9KVAd5TCtr1UIFppxmYFIZgR7zz2V5FSqACABEoAVqHDHly6vfsEq4wDhJzhN2AI5NOe6MERYLfJT9TdUVFAIbGMCcZxJ9epWyIShjNp0By7HFR3EbWDVj8q3o6bXmdXrQ5OVNe7G4c80f2mtpL9p/1TcyUw6SeKuNpQAAAABJRU5ErkJggg=='
  }

  const stone = {
    'readable': 'Stone',
    'id': 'minecraft:stone',
    'texture': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgBAMAAACBVGfHAAAALVBMVEUAAAA7OztAQEBWVlZeXl50dHR/f39qampISEiPj49NTU00NDRoaGiAgIBBQUFWXyGYAAAAAXRSTlMAQObYZgAAAUdJREFUeF51jjFrwzAUhP0XniZDJmkSGLpIIPAqgaG7DIasfmBwJxkE2azJ0FkB7YZCx0yFzs3vqkQIJENuu093T1e9Eo7PfopDfPSpP89DenjHDzyOw3D31/ForR3Ge2vsx+zTbPv5r3iL1k4Rj4hxwD4DbW3OXCc72YgkAyNSLqQ42IRAM3j3HaLtp5gwBJZB1/oTJjuc8XPjpAAj3GLHOPOVwGcGyu3KC0TYarqFDJwWi9wl3SDU6++tInSnGVyA8JIwGShhGgbkQnlJOLV8eclXILQuCa2ENOrE84WftQDjpN7dN30DEkgZtjtncqumpOGh7NDat517Dw009W2pMK1UC1/rQ4Ct3GhFp5ynsOXtJSG0Ucti2Mrqw8qqrFYI1xnGADhkm+VlK04XYOXTm0xnJK2h+DvRntOtepCQDKonGahe6B/7Hmuy2OXaXQAAAABJRU5ErkJggg=='
  }

  /*
   [
     "   ",
     " ##",
     " ##"
   ]
   */
  const ingredients = [
    new Ingredient(),
    new Ingredient(),
    new Ingredient(),
    new Ingredient(),
    new Ingredient(dirt.id, dirt.readable, dirt.texture),
    new Ingredient(dirt.id, dirt.readable, dirt.texture),
    new Ingredient(),
    new Ingredient(dirt.id, dirt.readable, dirt.texture),
    new Ingredient(dirt.id, dirt.readable, dirt.texture)
  ]

  it('should correctly return item type with data', () => {
    const generator = new CraftingGenerator()

    expect(
      generator.getItemType('minecraft:stone', 1)
    ).toEqual({
      data: 1,
      item: 'minecraft:stone'
    })
  })

  it('should correctly return item type without data', () => {
    const generator = new CraftingGenerator()

    expect(
      generator.getItemType('minecraft:stone', 0)
    ).toEqual({
      item: 'minecraft:stone'
    })
  })

  it('should separate name and data', () => {
    const generator = new CraftingGenerator()

    expect(
      generator.separateNameAndData('minecraft:stone:1')
    ).toEqual({
      data: 1,
      name: 'minecraft:stone'
    })
  })

  it('should output shapeless', () => {
    const generator = new CraftingGenerator(
      ingredients,
      new Ingredient(stone.id, stone.readable, stone.texture)
    )

    expect(
      generator.shapeless()
    ).toMatchSnapshot()
  })

  it('should output shaped with spaces', () => {
    const generator = new CraftingGenerator(
      ingredients,
      new Ingredient(stone.id, stone.readable, stone.texture)
    )

    expect(
      generator.shaped(false)
    ).toMatchSnapshot()
  })

  it('should output shaped without spaces', () => {
    const generator = new CraftingGenerator(
      ingredients,
      new Ingredient(stone.id, stone.readable, stone.texture)
    )

    expect(
      generator.shaped(true)
    ).toMatchSnapshot()
  })
})
