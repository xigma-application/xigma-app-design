import { isEqual } from 'lodash';

// types
import { TPaint } from 'types/design/paint/types';
import { TVectorNode } from 'types/design/types';

// utils
import { getVectorPanelFills } from './getVectorPanelFills';
import { isColorPaint } from 'utils/design/paint/isColorPaint';

export const getVectorPaintToolFill = (nodes: TVectorNode[]): TPaint[] | null => {
  const [fill = null, ...others] = nodes.map(getVectorPanelFills);
  const isShared = others.every((other) => isEqual(other, fill));

  return fill && isShared && fill.some((paint) => !isColorPaint(paint)) ? fill : null;
};
