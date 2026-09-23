export type TFlowReorderSelectionLine = { firstIndex: number; lastIndex: number; lineEnd: number; lineIndex: number; lineStart: number };

export const getFlowReorderSelectionLine = (lineGroups: string[][], orderedSelectedIds: string[]): TFlowReorderSelectionLine | null => {
  const flowIds = lineGroups.flat();
  const selectedIndexes = orderedSelectedIds.map((id) => flowIds.indexOf(id));
  const isContiguousRun = selectedIndexes.every(
    (index, position) => index !== -1 && (position === 0 || index === selectedIndexes[position - 1] + 1),
  );

  if (isContiguousRun) {
    const lineIndex = lineGroups.findIndex((line) => line.includes(orderedSelectedIds[0]));
    const line = lineGroups[lineIndex];
    const lineStart = flowIds.indexOf(line[0]);
    const lineEnd = lineStart + line.length - 1;
    const [firstIndex] = selectedIndexes;
    const lastIndex = selectedIndexes[selectedIndexes.length - 1];
    const isWithinOneLine = firstIndex >= lineStart && lastIndex <= lineEnd;

    if (isWithinOneLine) {
      return { firstIndex, lastIndex, lineEnd, lineIndex, lineStart };
    }
  }

  return null;
};
