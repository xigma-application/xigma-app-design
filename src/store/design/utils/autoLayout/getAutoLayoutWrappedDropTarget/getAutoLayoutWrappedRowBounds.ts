// types
import { AlignmentLayout } from 'types/design/enums';
import { TAutoLayoutChildSize } from '../getAutoLayoutChildPositions/getAutoLayoutChildPositions';
import { TDraftRect, TPoint } from 'types/canvas';

// utils
import { getAutoLayoutCursorRowRange } from './getAutoLayoutCursorRowRange';
import { getAutoLayoutReorderOriginChildren } from './getAutoLayoutReorderOriginChildren';
import { getAutoLayoutRowFrame } from './getAutoLayoutRowFrame';
import { toRealCutIndex } from './toRealCutIndex';

export type TAutoLayoutWrappedRowBounds = { realEnd: number; realStart: number; rowFrame: TDraftRect; rowOriginalIndex: number | null };

export const getAutoLayoutWrappedRowBounds = (
  isHorizontal: boolean,
  itemSpacing: number,
  counterAxisSpacing: number,
  alignment: AlignmentLayout,
  contentBox: TDraftRect,
  children: TAutoLayoutChildSize[],
  originalIndex: number | null,
  draggedSize: { height: number; width: number },
  cursorPoint: TPoint,
): TAutoLayoutWrappedRowBounds => {
  const rowDetectionChildren = getAutoLayoutReorderOriginChildren(children, originalIndex, draggedSize);
  const { bandEnd, bandStart, end, start } = getAutoLayoutCursorRowRange(
    isHorizontal,
    itemSpacing,
    counterAxisSpacing,
    alignment,
    contentBox,
    rowDetectionChildren,
    cursorPoint,
  );
  const realStart = toRealCutIndex(start, originalIndex);
  const realEnd = toRealCutIndex(end, originalIndex);
  const rowOriginalIndex = originalIndex === null ? null : originalIndex - realStart;
  const rowFrame = getAutoLayoutRowFrame(isHorizontal, contentBox, bandStart, bandEnd);

  return { realEnd, realStart, rowFrame, rowOriginalIndex };
};
