// types
import { TPaint } from 'types/design/paint/types';

export type TFillReorderResult = { fills: TPaint[]; selectedIndices: number[] };

export const getFillReorderResult = (fills: TPaint[], sourceIndices: number[], insertionSlot: number): TFillReorderResult => {
  const sortedSources = [...sourceIndices].sort((left, right) => left - right);
  const sourceSet = new Set(sortedSources);
  const movedItems = sortedSources.map((index) => fills[index]);
  const remaining = fills.filter((_fill, index) => !sourceSet.has(index));
  const removedBeforeInsertion = sortedSources.filter((index) => index < insertionSlot).length;
  const adjustedInsertion = insertionSlot - removedBeforeInsertion;

  return {
    fills: [...remaining.slice(0, adjustedInsertion), ...movedItems, ...remaining.slice(adjustedInsertion)],
    selectedIndices: movedItems.map((_fill, offset) => adjustedInsertion + offset),
  };
};
