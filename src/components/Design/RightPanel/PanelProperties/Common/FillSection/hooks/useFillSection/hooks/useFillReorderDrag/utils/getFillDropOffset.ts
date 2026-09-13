export const getFillDropOffset = (rows: Map<number, HTMLElement>, container: HTMLElement, fillCount: number, dropIndex: number): number => {
  const containerTop = container.getBoundingClientRect().top;

  if (dropIndex >= fillCount) {
    const lastRow = rows.get(fillCount - 1);
    return lastRow ? lastRow.getBoundingClientRect().bottom - containerTop : 0;
  }

  const row = rows.get(dropIndex);
  return row ? row.getBoundingClientRect().top - containerTop : 0;
};
