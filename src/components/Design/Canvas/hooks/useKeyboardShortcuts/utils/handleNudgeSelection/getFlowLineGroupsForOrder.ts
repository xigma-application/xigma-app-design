// types
import { TAutoLayoutChildSize } from 'store/design/utils/autoLayout/getAutoLayoutChildPositions/getAutoLayoutChildPositions';
import { TFrameNode } from 'types/design/types';

// utils
import { getFlowWrapSizingConfig } from './getFlowWrapSizingConfig';
import { groupAutoLayoutChildrenIntoLines } from 'store/design/utils/autoLayout/groupAutoLayoutChildrenIntoLines';

export const getFlowLineGroupsForOrder = (
  frame: TFrameNode,
  sizesById: Map<string, TAutoLayoutChildSize>,
  orderedIds: string[],
): string[][] => {
  if (frame.layoutWrap) {
    const orderedSizes = orderedIds.map((id) => sizesById.get(id)).filter((size): size is TAutoLayoutChildSize => size !== undefined);
    const { availablePrimary, isHorizontal, itemSpacing } = getFlowWrapSizingConfig(frame);
    const lines = groupAutoLayoutChildrenIntoLines(isHorizontal, itemSpacing, availablePrimary, orderedSizes);

    return lines.map((line) => line.map((size) => size.id));
  }

  return [orderedIds];
};
