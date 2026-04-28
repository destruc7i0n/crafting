const itemGroupsUrl =
  "https://raw.githubusercontent.com/destruc7i0n/item-groups-dumper/main/generated/items_grouped.json";

export type ItemGroupOrder = ReadonlyMap<string, number>;

export async function loadItemGroupOrder(): Promise<ItemGroupOrder> {
  const response = await fetch(itemGroupsUrl);

  if (!response.ok) {
    throw new Error(`Failed to fetch item group order (${response.status})`);
  }

  return parseItemGroupOrder(await response.json());
}

export function parseItemGroupOrder(value: unknown): ItemGroupOrder {
  if (!isRecord(value)) {
    throw new Error("Item group order payload must be an object");
  }

  const order = new Map<string, number>();

  for (const [groupName, itemIds] of Object.entries(value)) {
    if (!Array.isArray(itemIds)) {
      throw new Error(`Item group ${groupName} must be an array`);
    }

    for (const itemId of itemIds) {
      if (typeof itemId !== "string") {
        throw new Error(`Item group ${groupName} contains a non-string item id`);
      }

      if (!order.has(itemId)) {
        order.set(itemId, order.size);
      }
    }
  }

  return order;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
