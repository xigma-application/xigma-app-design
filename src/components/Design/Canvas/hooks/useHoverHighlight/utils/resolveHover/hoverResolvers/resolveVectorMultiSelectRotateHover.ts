// types
import { THoverResolverContext, THoverResult } from '../types';

// utils
import { getRotateCursorAngle } from 'utils/math/getRotateCursorAngle';
import { getRotatedCursorUrl } from 'utils/canvas/createCursorRotator/getRotatedCursorUrl';
import { isInVectorMultiSelectRotateRing } from '../../../../../utils/isInVectorMultiSelectRotateRing';

export const resolveVectorMultiSelectRotateHover = ({
  point,
  vectorMultiSelectBox,
  viewport,
}: THoverResolverContext): THoverResult | undefined => {
  if (
    vectorMultiSelectBox &&
    isInVectorMultiSelectRotateRing(point, vectorMultiSelectBox.bounds, viewport, vectorMultiSelectBox.rotation)
  ) {
    return {
      className: null,
      cursor: getRotatedCursorUrl('rotate', getRotateCursorAngle(point, vectorMultiSelectBox.bounds, vectorMultiSelectBox.rotation)) ?? '',
      nodeId: null,
    };
  }
};
