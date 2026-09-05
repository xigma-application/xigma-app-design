export const getAutoLayoutOriginalIndex = (childIds: string[], movedNodeIds: string[]): number =>
  childIds.filter((id) => !movedNodeIds.includes(id) || id === movedNodeIds[0]).indexOf(movedNodeIds[0]);
