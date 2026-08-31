// types
import { ToolName } from 'types/design/enums';
import { THoverResolverContext, THoverResult } from '../types';

// utils
import { getResizeCursorAngle } from 'utils/math/getResizeCursorAngle';
import { getRotatedCursorUrl } from 'utils/canvas/createCursorRotator/getRotatedCursorUrl';

export const resolveResizeHover = ({ resizeHandleHit, activeTool }: THoverResolverContext): THoverResult | undefined => {
  if (resizeHandleHit) {
    const cursorKind = activeTool === ToolName.scale ? 'scale' : 'resize';
    const cursor = getRotatedCursorUrl(cursorKind, getResizeCursorAngle(resizeHandleHit.handle, resizeHandleHit.rotation)) ?? '';

    return { className: null, cursor, nodeId: null };
  }
};
