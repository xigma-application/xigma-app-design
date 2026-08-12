export const toggleSelection = (current: string[], id: string): string[] =>
  current.includes(id) ? current.filter((selectedId) => selectedId !== id) : [...current, id];
