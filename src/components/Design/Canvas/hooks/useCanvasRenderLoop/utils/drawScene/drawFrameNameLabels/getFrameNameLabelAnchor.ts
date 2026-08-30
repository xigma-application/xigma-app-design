// others
import { FRAME_NAME_LABEL_FONT_SIZE_PX, FRAME_NAME_LABEL_GAP_PX } from 'constant/canvas';

// types
import { TFrameNode } from 'types/design/types';
import { TPoint } from 'types/canvas';

// utils
import { rotatePoint } from 'utils/math/rotatePoint';

export type TFrameNameLabelAnchor = {
  angleDeg: number;
  point: TPoint;
};

export const getFrameNameLabelAnchor = (node: TFrameNode, zoom: number): TFrameNameLabelAnchor => {
  const center: TPoint = { x: node.x + node.width / 2, y: node.y + node.height / 2 };
  const offset = (FRAME_NAME_LABEL_FONT_SIZE_PX + FRAME_NAME_LABEL_GAP_PX) / zoom;
  const point = rotatePoint({ x: node.x, y: node.y - offset }, center, node.rotation);

  return { angleDeg: node.rotation, point };
};
