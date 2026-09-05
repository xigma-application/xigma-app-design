// types
import { TDraftRect } from 'types/canvas';
import { TSmartSelectionLayout, TSmartSelectionNode } from 'types/design/smartSelection/types';

export const getLayoutExtent = (layout: TSmartSelectionLayout): TDraftRect => {
  const nodes = layout.type === 'grid' ? layout.cells.flat().filter((cell): cell is TSmartSelectionNode => cell !== null) : layout.nodes;
  const allBounds = nodes.map((node) => node.bounds);
  const left = Math.min(...allBounds.map((bounds) => bounds.x));
  const top = Math.min(...allBounds.map((bounds) => bounds.y));
  const right = Math.max(...allBounds.map((bounds) => bounds.x + bounds.width));
  const bottom = Math.max(...allBounds.map((bounds) => bounds.y + bounds.height));

  return { height: bottom - top, width: right - left, x: left, y: top };
};
