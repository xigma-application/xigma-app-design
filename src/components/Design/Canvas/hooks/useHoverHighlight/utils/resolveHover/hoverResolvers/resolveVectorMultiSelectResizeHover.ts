// types
import { THoverResolverContext, THoverResult } from '../types';

// utils
import { getResizeCursorAngle } from 'utils/math/getResizeCursorAngle';
import { getRotatedCursorUrl } from 'utils/canvas/createCursorRotator/getRotatedCursorUrl';

export const resolveVectorMultiSelectResizeHover = ({
  vectorMultiSelectBox,
  vectorMultiSelectResizeHandle,
}: THoverResolverContext): THoverResult | undefined => {
  if (vectorMultiSelectResizeHandle && vectorMultiSelectBox) {
    return {
      className: null,
      cursor: getRotatedCursorUrl('resize', getResizeCursorAngle(vectorMultiSelectResizeHandle, vectorMultiSelectBox.rotation)) ?? '',
      nodeId: null,
    };
  }
};
