export const hasMatchingItemTypes = <TItem extends { type: string }>(lists: TItem[][]): boolean => {
  const types = (lists[0] ?? []).map((item) => item.type);
  return lists.every((items) => items.length === types.length && items.every((item, index) => item.type === types[index]));
};
