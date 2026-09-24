import { TSmartSelectionLayout, TSmartSelectionNode } from 'types/design/smartSelection/types';

export const getSmartSelectionLayoutNodes = (layout: TSmartSelectionLayout): TSmartSelectionNode[] =>
  layout.type === 'grid' ? layout.cells.flat().filter((cell): cell is TSmartSelectionNode => cell !== null) : layout.nodes;
