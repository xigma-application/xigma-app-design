export const moveIdsToEdge = (order: string[], ids: Set<string>, edge: 'end' | 'start'): void => {
  const moving = order.filter((id) => ids.has(id));
  const staying = order.filter((id) => !ids.has(id));
  const next = edge === 'end' ? [...staying, ...moving] : [...moving, ...staying];

  order.splice(0, order.length, ...next);
};
