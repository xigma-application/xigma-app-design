import { nanoid } from '@reduxjs/toolkit';

// types
import { TLoopEdge } from 'utils/canvas/vectorNetwork/convertShapeToVector/utils/buildClosedVectorLoop';
import { TVectorNode } from 'types/design/types';

// utils
import { buildVectorNodeFromEdgeLoops } from 'utils/canvas/vectorNetwork/buildVectorNodeFromLoops/buildVectorNodeFromEdgeLoops';
import { mergeVectorNodeGeometriesWithHoleDetection } from 'utils/canvas/vectorNetwork/buildVectorNodeFromLoops/mergeVectorNodeGeometriesWithHoleDetection/mergeVectorNodeGeometriesWithHoleDetection';

export const getGlyphFillVectors = (glyphContours: TLoopEdge[][][], fill: string): (TVectorNode | null)[] =>
  glyphContours.map((contours) => {
    const contourVectors = contours
      .map((contour) => buildVectorNodeFromEdgeLoops([contour], { id: nanoid(), name: '', parentId: null, rotation: 0 }, fill))
      .filter((vector): vector is TVectorNode => vector !== null);

    return mergeVectorNodeGeometriesWithHoleDetection(contourVectors, { id: nanoid(), name: '', parentId: null, rotation: 0 }, fill);
  });
