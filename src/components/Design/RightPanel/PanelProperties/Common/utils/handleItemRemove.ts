export const handleItemRemove = <TItem>(
  index: number,
  closeOpenPanel: TFunc,
  setSelectedIndices: TFunc<[number[]]>,
  commit: TFunc<[TFunc<[TItem[]], TItem[]>]>,
): void => {
  closeOpenPanel();
  setSelectedIndices([]);
  commit((items) => items.filter((_item, itemIndex) => itemIndex !== index));
};
