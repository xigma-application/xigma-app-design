// types
import { TDraftRect } from 'types/canvas';

// utils
import { formatSvgNumber } from './formatSvgNumber';
import { toSvgPagePoint } from './toSvgPagePoint';

export const getSvgRotateTransformValue = (rotation: number, rect: TDraftRect, bounds: TDraftRect): string => {
  if (rotation === 0) {
    return '';
  }

  const center = toSvgPagePoint({ x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }, bounds);

  return `rotate(${formatSvgNumber(rotation)} ${formatSvgNumber(center.x)} ${formatSvgNumber(center.y)})`;
};
