// types
import { TDropDepthRange, TTreeItem, TTreeRow } from '../../../../types';

export const getDropDepthRange = <T extends TTreeItem>(rows: TTreeRow<T>[], insertionIndex: number): TDropDepthRange => {
  const beforeDepth = rows[insertionIndex - 1]?.depth ?? 0;
  const afterDepth = rows[insertionIndex]?.depth ?? 0;

  return { max: Math.max(beforeDepth, afterDepth), min: Math.min(beforeDepth, afterDepth) };
};
