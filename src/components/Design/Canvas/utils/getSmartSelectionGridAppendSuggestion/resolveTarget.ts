// types
import { TSmartSelectionGridLayout, TSmartSelectionNode } from 'types/design/smartSelection/types';
import { TGridAppendTarget } from './types';

// utils
import { findNearestHole } from './findNearestHole';
import { resolveExtend } from './resolveExtend';

export const resolveTarget = (outlier: TSmartSelectionNode, layout: TSmartSelectionGridLayout): TGridAppendTarget | null => {
  const hasHole = layout.cells.flat().some((cell) => cell === null);

  return hasHole ? findNearestHole(outlier, layout) : resolveExtend(outlier, layout);
};
