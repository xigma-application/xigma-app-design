// types
import { AlignmentLayout } from 'types/design/enums';
import { TAutoLayoutChildSize } from '../getAutoLayoutChildPositions/getAutoLayoutChildPositions';
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { getAlignmentComponents } from '../getAlignmentComponents';
import { getAutoLayoutBlockCounterLength } from '../getAutoLayoutBlockCounterLength';
import { getAutoLayoutLineThickness } from '../getAutoLayoutLineThickness';
import { getAxisOffset } from '../getAxisOffset';
import { groupAutoLayoutChildrenIntoLines } from '../groupAutoLayoutChildrenIntoLines';

export type TAutoLayoutCursorRowRange = { bandEnd: number; bandStart: number; end: number; start: number };

type TAutoLayoutLineBand = { end: number; start: number };

const getAutoLayoutCursorRow = (
  lines: TAutoLayoutChildSize[][],
  lineBands: TAutoLayoutLineBand[],
  cursorCounter: number,
): TAutoLayoutCursorRowRange => {
  let rowIndex = lineBands.length - 1;

  for (let index = 0; index < lineBands.length - 1; index += 1) {
    const boundary = (lineBands[index].end + lineBands[index + 1].start) / 2;

    if (cursorCounter < boundary) {
      rowIndex = index;
      break;
    }
  }

  const start = lines.slice(0, rowIndex).reduce((total, line) => total + line.length, 0);

  return { bandEnd: lineBands[rowIndex].end, bandStart: lineBands[rowIndex].start, end: start + lines[rowIndex].length, start };
};

const getAutoLayoutLineBands = (
  counterAxisSpacing: number,
  initialCounterOffset: number,
  lineThicknesses: number[],
): TAutoLayoutLineBand[] => {
  let counterOffset = initialCounterOffset;

  return lineThicknesses.map((thickness) => {
    const start = counterOffset;
    counterOffset += thickness + counterAxisSpacing;

    return { end: start + thickness, start };
  });
};

export const getAutoLayoutCursorRowRange = (
  isHorizontal: boolean,
  itemSpacing: number,
  counterAxisSpacing: number,
  alignment: AlignmentLayout,
  contentBox: TDraftRect,
  children: TAutoLayoutChildSize[],
  cursorPoint: TPoint,
): TAutoLayoutCursorRowRange => {
  if (children.length !== 0) {
    const availablePrimary = isHorizontal ? contentBox.width : contentBox.height;
    const availableCounter = isHorizontal ? contentBox.height : contentBox.width;
    const { x: xAlign, y: yAlign } = getAlignmentComponents(alignment);
    const counterAlign = isHorizontal ? yAlign : xAlign;
    const lines = groupAutoLayoutChildrenIntoLines(isHorizontal, itemSpacing, availablePrimary, children);
    const lineThicknesses = lines.map((line) => getAutoLayoutLineThickness(isHorizontal, line));
    const blockCounterLength = getAutoLayoutBlockCounterLength(counterAxisSpacing, lineThicknesses);
    const counterOffset = getAxisOffset(counterAlign, availableCounter, blockCounterLength);
    const lineBands = getAutoLayoutLineBands(counterAxisSpacing, counterOffset, lineThicknesses);
    const cursorCounter = isHorizontal ? cursorPoint.y - contentBox.y : cursorPoint.x - contentBox.x;

    return getAutoLayoutCursorRow(lines, lineBands, cursorCounter);
  }

  return { bandEnd: 0, bandStart: 0, end: 0, start: 0 };
};
