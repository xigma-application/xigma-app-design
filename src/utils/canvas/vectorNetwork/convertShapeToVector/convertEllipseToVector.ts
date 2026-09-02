// others
import { ELLIPSE_SEGMENTS } from 'constant/canvas';

// types
import { NodeType } from 'types/design/enums';
import { TPoint } from 'types/canvas';
import { TEllipseNode, TVectorNode } from 'types/design/types';

// utils
import { buildClosedLoopFromEdges, TLoopEdge } from './utils/buildClosedVectorLoop';
import { getEffectiveArcAngles } from 'utils/canvas/ellipseArc/getEffectiveArcAngles';
import { getEllipseArcPoints } from 'utils/canvas/shapes/getEllipseArcPoints';
import { getFillDataForClosedLoop } from './utils/getFillDataForClosedLoop';
import { hasEllipseArc } from 'utils/canvas/ellipseArc/hasEllipseArc';
import { makeSolidPaint } from 'utils/design/paint/makeSolidPaint';
import { flipPoint } from 'utils/math/flipPoint';

const SHAPE_VECTOR_STROKE_WIDTH = 0;
const ELLIPSE_BEZIER_KAPPA = 0.5522847498;

const getFullEllipseEdges = (centerX: number, centerY: number, radiusX: number, radiusY: number): TLoopEdge[] => {
  const kx = radiusX * ELLIPSE_BEZIER_KAPPA;
  const ky = radiusY * ELLIPSE_BEZIER_KAPPA;
  const points: TPoint[] = [
    { x: centerX, y: centerY - radiusY },
    { x: centerX + radiusX, y: centerY },
    { x: centerX, y: centerY + radiusY },
    { x: centerX - radiusX, y: centerY },
  ];
  const tangentsStart: TPoint[] = [
    { x: kx, y: 0 },
    { x: 0, y: ky },
    { x: -kx, y: 0 },
    { x: 0, y: -ky },
  ];
  const tangentsEnd: TPoint[] = [
    { x: 0, y: -ky },
    { x: kx, y: 0 },
    { x: 0, y: ky },
    { x: -kx, y: 0 },
  ];

  return points.map((start, index) => ({
    end: points[(index + 1) % points.length],
    start,
    tangentEnd: tangentsEnd[index],
    tangentStart: tangentsStart[index],
  }));
};

const getArcCutEdges = (node: TEllipseNode, arcStartAngle: number, arcEndAngle: number): TLoopEdge[] => {
  const center = { x: node.x + node.width / 2, y: node.y + node.height / 2 };
  const arcRatio = Math.min(Math.max(node.arcRatio ?? 0, 0), 1);
  const { effectiveEndAngle, effectiveStartAngle } = getEffectiveArcAngles(arcStartAngle, arcEndAngle, node.arcRatioInverted ?? false);
  const outerPoints = getEllipseArcPoints(node, effectiveStartAngle, effectiveEndAngle, ELLIPSE_SEGMENTS).map((point) =>
    flipPoint(point, center, node.flipX ?? false, node.flipY ?? false),
  );
  const innerPoints =
    arcRatio > 0
      ? getEllipseArcPoints(node, effectiveStartAngle, effectiveEndAngle, ELLIPSE_SEGMENTS, arcRatio).map((point) =>
          flipPoint(point, center, node.flipX ?? false, node.flipY ?? false),
        )
      : null;
  const loopPoints = innerPoints ? [...outerPoints, ...[...innerPoints].reverse()] : [center, ...outerPoints];

  return loopPoints.map((start, index) => ({
    end: loopPoints[(index + 1) % loopPoints.length],
    start,
    tangentEnd: null,
    tangentStart: null,
  }));
};

export const convertEllipseToVector = (node: TEllipseNode): TVectorNode => {
  const arcStartAngle = node.arcStartAngle ?? 90;
  const arcEndAngle = node.arcEndAngle ?? 90;
  const isFullEllipse = !hasEllipseArc(arcStartAngle, arcEndAngle) && (node.arcRatio ?? 0) <= 0;
  const edges = isFullEllipse
    ? getFullEllipseEdges(node.x + node.width / 2, node.y + node.height / 2, node.width / 2, node.height / 2)
    : getArcCutEdges(node, arcStartAngle, arcEndAngle);
  const { segments, vertices } = buildClosedLoopFromEdges(edges);
  const base: TVectorNode = {
    defaultFill: [makeSolidPaint(node.fill)],
    filledFaceKeys: [],
    id: node.id,
    name: node.name,
    parentId: node.parentId,
    rotation: node.rotation,
    segments,
    strokeColor: node.fill,
    strokeWidth: SHAPE_VECTOR_STROKE_WIDTH,
    type: NodeType.vector,
    vertexHandleModes: {},
    vertices,
  };

  return { ...base, ...getFillDataForClosedLoop(base, node.fill) };
};
