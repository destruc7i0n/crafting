import JSZip from 'jszip'

import { saveAs } from 'file-saver'

import { compareMinecraftVersions } from './versions'

export const getPackFormat = (minecraftVersion) => {
  // https://minecraft.wiki/w/Pack_format
  switch (minecraftVersion) {
    case '1.12': {
      return 3
    }
    case '1.13':
    case '1.14': {
      return 4
    }
    case '1.15': {
      return 5
    }
    case '1.16': {
      return 6
    }
    case '1.17': {
      return 7
    }
    case '1.18': {
      return 8
    }
    case '1.19': {
      return 9
    }
    case '1.20': {
      return 15
    }
    case '1.21': {
      return 48
    }
    case '1.21.2': {
      return 57
    }
    case '1.21.4': {
      return 61
    }
    default: {
      return 1
    }
  }
}

export const generateTags = (tags = []) => {
  const downloadableTags = Object.keys(tags)
    .filter(tag => tags[tag].asTag)
    .filter(tag => tags[tag].namespace !== 'minecraft') // ignore minecraft ones

  return downloadableTags.map((tag) => ({
    namespace: tags[tag].namespace,
    name: tags[tag].name,
    data: {
      replace: false,
      values: tags[tag].items.map((item) => item.id)
    }
  }))
}

export const generateDatapack = (minecraftVersion, craftingRecipe, craftingName, rawTags) => {
  const generatedTags = generateTags(rawTags)

  const isAfter121 = compareMinecraftVersions(minecraftVersion, '1.21') <= 0
  const path = isAfter121 ? 'data/crafting/recipe/' : 'data/crafting/recipes/'

  let zip = new JSZip()
  // add the pack file
  zip.file('pack.mcmeta', JSON.stringify({
    pack: {
      pack_format: getPackFormat(minecraftVersion),
      description: 'Generated with TheDestruc7i0n\'s Crafting Generator: https://crafting.thedestruc7i0n.ca'
    }
  }))
  // add the crafting recipe
  zip.file(path + craftingName, JSON.stringify(craftingRecipe, null, 4))
  // add all the tags
  generatedTags.forEach(({ namespace, name, data }) => {
    zip.file(`data/${namespace}/tags/items/${name}.json`, JSON.stringify(data, null, 4))
  })
  // generate and download
  zip.generateAsync({ type: 'blob' })
    .then((content) => saveAs(content, 'datapack.zip'))
}
