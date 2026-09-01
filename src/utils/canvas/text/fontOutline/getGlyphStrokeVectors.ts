// types
import { TLoopEdge } from 'utils/canvas/vectorNetwork/convertShapeToVector/utils/buildClosedVectorLoop';
import { TVectorNode } from 'types/design/types';

// utils
import { buildVectorNodeFromLoops } from 'utils/canvas/vectorNetwork/buildVectorNodeFromLoops/buildVectorNodeFromLoops';
import { flattenEdgeLoop } from './flattenEdgeLoop';
import { getStrokeOutlinePolygons } from 'utils/canvas/vectorNetwork/getStrokeOutlinePolygons/getStrokeOutlinePolygons';
import { mergeVectorNodeGeometries } from 'utils/canvas/vectorNetwork/buildVectorNodeFromLoops/mergeVectorNodeGeometries';
import { nanoid } from '@reduxjs/toolkit';

const getContourStrokeBand = (edges: TLoopEdge[], halfWidth: number, strokeColor: string): TVectorNode | null => {
  const points = flattenEdgeLoop(edges);
  const { inner, outer } = getStrokeOutlinePolygons(points, halfWidth, true);

  return buildVectorNodeFromLoops([outer, inner], { id: nanoid(), name: 'Contour', parentId: null, rotation: 0 }, strokeColor);
};

export const getGlyphStrokeVectors = (glyphContours: TLoopEdge[][][], halfWidth: number, strokeColor: string): (TVectorNode | null)[] =>
  glyphContours.map((contours) => {
    const bands = contours
      .map((edges) => getContourStrokeBand(edges, halfWidth, strokeColor))
      .filter((vector): vector is TVectorNode => vector !== null);

    return mergeVectorNodeGeometries(bands, { id: nanoid(), name: '', parentId: null, rotation: 0 }, strokeColor);
  });
