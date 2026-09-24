export const getReorderedItems = <TItem>(nodeItems: TItem[], shownItems: TItem[], reorderedItems: TItem[]): TItem[] =>
  reorderedItems.map((item) => nodeItems[shownItems.indexOf(item)] ?? item);
