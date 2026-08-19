// types
import { ToolName } from 'types/design/enums';
import { THoverResolverContext, THoverResult } from '../types';

// utils
import { getResizeCursorAngle } from 'utils/math/getResizeCursorAngle';
import { getRotatedResizeCursorUrl } from 'utils/canvas/getRotatedResizeCursorUrl';
import { getRotatedScaleCursorUrl } from 'utils/canvas/getRotatedScaleCursorUrl';

export const resolveResizeHover = ({ resizeHandleHit, activeTool }: THoverResolverContext): THoverResult | undefined => {
  if (resizeHandleHit) {
    const getCursorUrl = activeTool === ToolName.scale ? getRotatedScaleCursorUrl : getRotatedResizeCursorUrl;
    const cursor = getCursorUrl(getResizeCursorAngle(resizeHandleHit.handle, resizeHandleHit.rotation)) ?? '';

    return { className: null, cursor, nodeId: null };
  }
};
