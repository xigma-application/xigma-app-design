// others
import { FRAME_NAME_LABEL_FONT_SIZE_PX, FRAME_NAME_LABEL_GAP_PX } from 'constant/canvas';

// types
import { TFrameNode } from 'types/design/types';
import { TPoint } from 'types/canvas';

// utils
import { rotatePoint } from 'utils/math/rotatePoint';

export type TFrameNameLabelAnchor = {
  angleDeg: number;
  maxWidth: number;
  point: TPoint;
};

type TDimension = 'height' | 'width';

type TCorner = {
  dimension: TDimension;
  normal: TPoint;
  point: TPoint;
};

const getCorners = (node: TFrameNode): TCorner[] => {
  const { height, width, x, y } = node;

  return [
    { dimension: 'width', normal: { x: 0, y: -1 }, point: { x, y } },
    { dimension: 'height', normal: { x: 1, y: 0 }, point: { x: x + width, y } },
    { dimension: 'width', normal: { x: 0, y: 1 }, point: { x: x + width, y: y + height } },
    { dimension: 'height', normal: { x: -1, y: 0 }, point: { x, y: y + height } },
  ];
};

const rotateCorner = (corner: TCorner, center: TPoint, rotation: number): TCorner => ({
  ...corner,
  normal: rotatePoint(corner.normal, { x: 0, y: 0 }, rotation),
  point: rotatePoint(corner.point, center, rotation),
});

const pickTopCorner = (corners: TCorner[]): TCorner => corners.reduce((top, corner) => (corner.normal.y < top.normal.y ? corner : top));

export const getFrameNameLabelAnchor = (node: TFrameNode, zoom: number): TFrameNameLabelAnchor => {
  const center: TPoint = { x: node.x + node.width / 2, y: node.y + node.height / 2 };
  const offset = (FRAME_NAME_LABEL_FONT_SIZE_PX + FRAME_NAME_LABEL_GAP_PX) / zoom;
  const corners = getCorners(node).map((corner) => rotateCorner(corner, center, node.rotation));
  const { dimension, normal, point: corner } = pickTopCorner(corners);
  const point: TPoint = { x: corner.x + normal.x * offset, y: corner.y + normal.y * offset };
  const angleDeg = (Math.atan2(normal.y, normal.x) * 180) / Math.PI + 90;
  const maxWidth = dimension === 'width' ? node.width : node.height;

  return { angleDeg, maxWidth, point };
};
