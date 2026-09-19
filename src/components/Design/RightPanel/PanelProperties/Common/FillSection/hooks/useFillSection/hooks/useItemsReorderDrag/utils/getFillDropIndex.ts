export const getFillDropIndex = (fillCount: number, rows: Map<number, HTMLElement>, clientY: number): number =>
  Array.from({ length: fillCount }, (_unused, index) => rows.get(index)?.getBoundingClientRect() ?? null).filter(
    (rect): rect is DOMRect => rect !== null && clientY > rect.top + rect.height / 2,
  ).length;
