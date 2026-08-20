// types
import { THoverResolverContext, THoverResult } from '../types';

// utils
import { getResizeCursorAngle } from 'utils/math/getResizeCursorAngle';
import { getRotatedResizeCursorUrl } from 'utils/canvas/getRotatedResizeCursorUrl';

export const resolveVectorMultiSelectResizeHover = ({
  vectorMultiSelectBox,
  vectorMultiSelectResizeHandle,
}: THoverResolverContext): THoverResult | undefined => {
  if (vectorMultiSelectResizeHandle && vectorMultiSelectBox) {
    return {
      className: null,
      cursor: getRotatedResizeCursorUrl(getResizeCursorAngle(vectorMultiSelectResizeHandle, vectorMultiSelectBox.rotation)) ?? '',
      nodeId: null,
    };
  }
};
