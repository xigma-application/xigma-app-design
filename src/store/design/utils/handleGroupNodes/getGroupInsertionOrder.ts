export const getGroupInsertionOrder = (containerOrder: string[], memberIds: Set<string>, groupId: string): string[] => {
  const topMostIndex = containerOrder.reduce((max, id, index) => (memberIds.has(id) ? index : max), 0);
  const insertionIndex = containerOrder.slice(0, topMostIndex).filter((id) => !memberIds.has(id)).length;
  const remainingOrder = containerOrder.filter((id) => !memberIds.has(id));

  return [...remainingOrder.slice(0, insertionIndex), groupId, ...remainingOrder.slice(insertionIndex)];
};
