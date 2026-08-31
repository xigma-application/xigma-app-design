import { nanoid } from '@reduxjs/toolkit';

// types
import { TGlyphAtlasJson } from 'types/msdf';
import { TTextNode, TVectorNode } from 'types/design/types';

// utils
import { buildVectorNodeFromEdgeLoops } from 'utils/canvas/vectorNetwork/buildVectorNodeFromLoops/buildVectorNodeFromEdgeLoops';
import { getTextGlyphContours } from './getTextGlyphContours';
import { mergeVectorNodeGeometries } from 'utils/canvas/vectorNetwork/buildVectorNodeFromLoops/mergeVectorNodeGeometries';

export const getTextFlattenVector = async (atlas: TGlyphAtlasJson, node: TTextNode): Promise<TVectorNode | null> => {
  if (node.pathId) {
    return null;
  }

  const glyphContours = await getTextGlyphContours(atlas, node);
  const glyphVectors = glyphContours
    .map((contours) => buildVectorNodeFromEdgeLoops(contours, { id: nanoid(), name: node.name, parentId: null, rotation: 0 }, node.fill))
    .filter((vector): vector is TVectorNode => vector !== null);

  return mergeVectorNodeGeometries(
    glyphVectors,
    { id: nanoid(), name: node.name, parentId: node.parentId, rotation: node.rotation },
    node.fill,
  );
};
