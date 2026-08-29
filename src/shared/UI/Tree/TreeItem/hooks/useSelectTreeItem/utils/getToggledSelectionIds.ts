export const getToggledSelectionIds = (selectedIds: string[], id: string): string[] => {
  const isAlreadySelected = selectedIds.includes(id);

  if (isAlreadySelected) {
    return selectedIds.filter((selectedId) => selectedId !== id);
  }

  return [...selectedIds, id];
};
