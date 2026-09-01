# Crafting Generator

Generate JSON recipes for Minecraft Java and Bedrock with a drag and drop interface.

## Features

- Drag and drop recipe editor
  - Optimized for mobile devices
- Java (`1.12`+) and Bedrock support
- Crafting, furnace, stonecutter, and smithing recipe generation
- Custom items and tag editing
- Export as JSON, Java datapack, or Bedrock behavior pack

## Agent support (WebMCP)

The editor page (`/`) registers tools on `document.modelContext` (older Chrome: `navigator.modelContext`) per the [W3C WebMCP draft](https://webmachinelearning.github.io/webmcp/), so browser agents can build recipes without clicking through the UI. Tools go through the same store actions and validation as the UI, update the page live, and are only registered in browsers that support the API. Nothing is sent to a server; all state stays in localStorage.

| Tool                    | Purpose                                                                          |
| ----------------------- | -------------------------------------------------------------------------------- |
| `get_editor_state`      | Version, recipe types, all recipes, and the selected recipe in full (call first) |
| `search_items`          | Fuzzy search vanilla items, custom items, and tags; returns refs                 |
| `get_recipe_json`       | Generated recipe JSON, file name, and validation errors                          |
| `set_minecraft_version` | Change version (Java <-> Bedrock requires `confirmClearAllSlots: true`)          |
| `create_recipe`         | Create and select a recipe                                                       |
| `select_recipe`         | Select a recipe by id                                                            |
| `delete_recipe`         | Delete a recipe (irreversible; last recipe cannot be deleted)                    |
| `update_recipe`         | Partial options for the selected recipe (type, name, group, cooking time, etc.)  |
| `set_slots`             | Set or clear several slots at once for any recipe type                           |
| `set_crafting_pattern`  | Replace the crafting grid using vanilla `pattern`/`key`/`result` shape           |
| `clear_recipe_slots`    | Clear the selected recipe's slots                                                |
| `create_custom_item`    | Register a modded item so it can be used as a ref                                |

Ingredients are referenced as `stick`, `minecraft:stick`, `minecraft:wool:3` (data value), `#minecraft:planks` (tag), `#crafting:my_tag` (custom tag), or `mymod:ruby` (custom item). Crafting slots are `crafting.1`-`crafting.9` (rows top to bottom) and `crafting.result`; see `public/llms.txt` for the full grammar, slot layout, and tool inputs.

To try it in Chrome 146+, enable `chrome://flags/#webmcp-for-testing`, open the editor, and run in DevTools:

```js
navigator.modelContextTesting.getTools();
navigator.modelContextTesting.executeTool("set_crafting_pattern", {
  pattern: ["###", " / ", " / "],
  key: { "#": "#minecraft:planks", "/": "stick" },
  result: "wooden_pickaxe",
});
```

## Building

Install dependencies and build:

```sh
pnpm install
pnpm run build
```

You'll find the built assets in the `dist/` folder.

## Testing

Run tests:

```sh
pnpm run test
```

## Contribute

Contributions are welcome.

## Acknowledgements

- [misode/mcmeta](https://github.com/misode/mcmeta) - processed vanilla data
- [GeyserMC/mappings](https://github.com/GeyserMC/mappings) - Java to Bedrock item mappings

## Licence

MIT
