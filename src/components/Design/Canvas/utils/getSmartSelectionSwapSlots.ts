// types
import { TSmartSelectionLayout, TSmartSelectionNode } from 'types/design/smartSelection/types';

export const getSmartSelectionSwapSlots = (layout: TSmartSelectionLayout): TSmartSelectionNode[] =>
  layout.type === 'grid' ? layout.cells.flat() : layout.nodes;
