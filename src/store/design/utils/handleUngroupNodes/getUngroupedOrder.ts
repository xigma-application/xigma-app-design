export const getUngroupedOrder = (containerOrder: string[], groupId: string, childIds: string[]): string[] => {
  const index = containerOrder.indexOf(groupId);

  return [...containerOrder.slice(0, index), ...childIds, ...containerOrder.slice(index + 1)];
};
