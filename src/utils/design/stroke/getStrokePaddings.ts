// types
import { TSceneNode } from 'types/design/types';
import { TStrokeSideWidths } from './types';

// utils
import { getStrokeAlignInset } from 'utils/canvas/getStrokeAlignInset/getStrokeAlignInset';
import { getStrokeSideWidths } from './getStrokeSideWidths';

const NO_PADDING: TStrokeSideWidths = { bottom: 0, left: 0, right: 0, top: 0 };

export const getStrokePaddings = (node: TSceneNode): TStrokeSideWidths => {
  const hasStroke = ('strokeColor' in node && Boolean(node.strokeColor)) || ('strokes' in node && (node.strokes ?? []).length > 0);

  if (hasStroke && 'strokeWidth' in node && node.strokeWidth) {
    const strokeAlign = 'strokeAlign' in node ? node.strokeAlign : undefined;
    const widths = getStrokeSideWidths(node);
    const outerOf = (width: number): number => getStrokeAlignInset(width, strokeAlign).outer;

    return { bottom: outerOf(widths.bottom), left: outerOf(widths.left), right: outerOf(widths.right), top: outerOf(widths.top) };
  }

  return NO_PADDING;
};
