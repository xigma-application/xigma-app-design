import { nanoid } from '@reduxjs/toolkit';

// types
import { TGlyphAtlasJson } from 'types/msdf';
import { TTextNode, TVectorNode } from 'types/design/types';

// utils
import { buildVectorNodeFromLoops } from 'utils/canvas/vectorNetwork/buildVectorNodeFromLoops/buildVectorNodeFromLoops';
import { flattenEdgeLoop } from './flattenEdgeLoop';
import { getStrokeOutlinePolygons } from 'utils/canvas/vectorNetwork/getStrokeOutlinePolygons/getStrokeOutlinePolygons';
import { getTextGlyphContours } from './getTextGlyphContours';
import { mergeVectorNodeGeometries } from 'utils/canvas/vectorNetwork/buildVectorNodeFromLoops/mergeVectorNodeGeometries';
import { TLoopEdge } from 'utils/canvas/vectorNetwork/convertShapeToVector/utils/buildClosedVectorLoop';

const getContourStrokeBand = (edges: TLoopEdge[], halfWidth: number, strokeColor: string): TVectorNode | null => {
  const points = flattenEdgeLoop(edges);
  const { inner, outer } = getStrokeOutlinePolygons(points, halfWidth, true);

  return buildVectorNodeFromLoops(
    inner ? [outer, inner] : [outer],
    { id: nanoid(), name: 'Contour', parentId: null, rotation: 0 },
    strokeColor,
  );
};

export const getTextStrokeOutlineVector = async (atlas: TGlyphAtlasJson, node: TTextNode): Promise<TVectorNode | null> => {
  const strokeWidth = node.strokeWidth ?? 0;

  if (node.pathId || !node.strokeColor || strokeWidth <= 0) {
    return null;
  }

  const glyphContours = await getTextGlyphContours(atlas, node);
  const halfWidth = strokeWidth / 2;
  const contourBands = glyphContours
    .flat()
    .map((edges) => getContourStrokeBand(edges, halfWidth, node.strokeColor as string))
    .filter((vector): vector is TVectorNode => vector !== null);

  return mergeVectorNodeGeometries(
    contourBands,
    { id: nanoid(), name: `${node.name} outline`, parentId: node.parentId, rotation: node.rotation },
    node.strokeColor,
  );
};
