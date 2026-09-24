export const getItemsWithPatch = <TItem extends object>(items: TItem[], index: number, getPatch: TFunc<[TItem], Partial<TItem>>): TItem[] =>
  items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...getPatch(item) } : item));
