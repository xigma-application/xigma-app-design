// types
import { TPoint } from 'types/canvas';

// utils
import { rotatePoint } from 'utils/math/rotatePoint';

export type TSelectionSizeLabelRect = {
  height: number;
  rotation: number;
  width: number;
  x: number;
  y: number;
};

export type TSelectionSizeLabelPlacement = {
  anchor: TPoint;
  angleDeg: number;
  offsetDirection: TPoint;
};

type TEdge = {
  mid: TPoint;
  normal: TPoint;
};

const getEdges = (rect: TSelectionSizeLabelRect): TEdge[] => {
  const { height, width, x, y } = rect;

  return [
    { mid: { x: x + width / 2, y }, normal: { x: 0, y: -1 } },
    { mid: { x: x + width, y: y + height / 2 }, normal: { x: 1, y: 0 } },
    { mid: { x: x + width / 2, y: y + height }, normal: { x: 0, y: 1 } },
    { mid: { x, y: y + height / 2 }, normal: { x: -1, y: 0 } },
  ];
};

const rotateEdge = (edge: TEdge, center: TPoint, rotation: number): TEdge => ({
  mid: rotatePoint(edge.mid, center, rotation),
  normal: rotatePoint(edge.normal, { x: 0, y: 0 }, rotation),
});

const pickBottomEdge = (edges: TEdge[]): TEdge => edges.reduce((bottom, edge) => (edge.normal.y > bottom.normal.y ? edge : bottom));

export const getSelectionSizeLabelPlacement = (rect: TSelectionSizeLabelRect): TSelectionSizeLabelPlacement => {
  const center: TPoint = { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
  const edges = getEdges(rect).map((edge) => rotateEdge(edge, center, rect.rotation));
  const bottom = pickBottomEdge(edges);

  return {
    anchor: bottom.mid,
    angleDeg: (Math.atan2(bottom.normal.y, bottom.normal.x) * 180) / Math.PI - 90,
    offsetDirection: bottom.normal,
  };
};
