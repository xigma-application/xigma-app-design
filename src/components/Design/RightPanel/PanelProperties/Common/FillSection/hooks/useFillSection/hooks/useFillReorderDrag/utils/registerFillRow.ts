export const registerFillRow =
  (rows: Map<number, HTMLElement>, index: number) =>
  (element: HTMLElement | null): void => {
    if (element) {
      rows.set(index, element);
      return;
    }

    rows.delete(index);
  };
