import { nanoid } from '@reduxjs/toolkit';

// types
import { TPoint } from 'types/canvas';
import { TVectorSegment, TVectorTangent, TVectorVertex } from 'types/design/types';

// utils
import { getRoundedCornerCurves } from './getRoundedCornerCurves';
import { getVertexAngles } from 'utils/math/getVertexAngles';

export type TLoopEdge = { end: TPoint; start: TPoint; tangentEnd: TVectorTangent; tangentStart: TVectorTangent };

const getPlainEdges = (sharpVertices: TPoint[]): TLoopEdge[] =>
  sharpVertices.map((start, index) => ({
    end: sharpVertices[(index + 1) % sharpVertices.length],
    start,
    tangentEnd: null,
    tangentStart: null,
  }));

const getRoundedEdges = (sharpVertices: TPoint[], radius: number): TLoopEdge[] => {
  const angles = getVertexAngles(sharpVertices);
  const corners = sharpVertices.map((vertex, index) => {
    const previous = sharpVertices[(index - 1 + sharpVertices.length) % sharpVertices.length];
    const next = sharpVertices[(index + 1) % sharpVertices.length];

    return getRoundedCornerCurves(vertex, previous, next, angles[index], radius);
  });

  return corners.flatMap((cornerCurves, index) => {
    const nextCornerCurves = corners[(index + 1) % corners.length];
    const lastCurve = cornerCurves[cornerCurves.length - 1];
    const straightEdge: TLoopEdge = { end: nextCornerCurves[0].start, start: lastCurve.end, tangentEnd: null, tangentStart: null };

    return [...cornerCurves, straightEdge];
  });
};

export const buildClosedLoopFromEdges = (
  edges: TLoopEdge[],
): { segments: Record<string, TVectorSegment>; vertices: Record<string, TVectorVertex> } => {
  const vertexIds = edges.map(() => nanoid());
  const vertices: Record<string, TVectorVertex> = {};
  const segments: Record<string, TVectorSegment> = {};

  edges.forEach((edge, index) => {
    vertices[vertexIds[index]] = { id: vertexIds[index], x: edge.start.x, y: edge.start.y };
  });

  edges.forEach((edge, index) => {
    const segmentId = nanoid();
    const startId = vertexIds[index];
    const endId = vertexIds[(index + 1) % vertexIds.length];

    segments[segmentId] = { endId, id: segmentId, startId, tangentEnd: edge.tangentEnd, tangentStart: edge.tangentStart };
  });

  return { segments, vertices };
};

export const buildClosedVectorLoop = (
  sharpVertices: TPoint[],
  radius: number,
): { segments: Record<string, TVectorSegment>; vertices: Record<string, TVectorVertex> } =>
  buildClosedLoopFromEdges(radius > 0 ? getRoundedEdges(sharpVertices, radius) : getPlainEdges(sharpVertices));
