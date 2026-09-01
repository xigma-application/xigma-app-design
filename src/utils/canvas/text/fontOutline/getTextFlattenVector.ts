import { nanoid } from '@reduxjs/toolkit';

// types
import { TGlyphAtlasJson } from 'types/msdf';
import { TSceneNode, TTextNode, TVectorNode } from 'types/design/types';

// utils
import { buildVectorNodeFromEdgeLoops } from 'utils/canvas/vectorNetwork/buildVectorNodeFromLoops/buildVectorNodeFromEdgeLoops';
import { getCurvedTextGlyphContours } from './getCurvedTextGlyphContours';
import { getTextGlyphContours } from './getTextGlyphContours';
import { mergeVectorNodeGeometries } from 'utils/canvas/vectorNetwork/buildVectorNodeFromLoops/mergeVectorNodeGeometries';
import { mergeVectorNodeGeometriesWithHoleDetection } from 'utils/canvas/vectorNetwork/buildVectorNodeFromLoops/mergeVectorNodeGeometriesWithHoleDetection/mergeVectorNodeGeometriesWithHoleDetection';

export const getTextFlattenVector = async (atlas: TGlyphAtlasJson, node: TTextNode, pathNode?: TSceneNode): Promise<TVectorNode | null> => {
  if (node.pathId && !pathNode) {
    return null;
  }

  const glyphContours = node.pathId ? await getCurvedTextGlyphContours(atlas, node, pathNode) : await getTextGlyphContours(atlas, node);
  const glyphVectors = glyphContours
    .map((contours) => {
      const contourVectors = contours
        .map((contour) =>
          buildVectorNodeFromEdgeLoops([contour], { id: nanoid(), name: node.name, parentId: null, rotation: 0 }, node.fill),
        )
        .filter((vector): vector is TVectorNode => vector !== null);

      return mergeVectorNodeGeometriesWithHoleDetection(
        contourVectors,
        { id: nanoid(), name: node.name, parentId: null, rotation: 0 },
        node.fill,
      );
    })
    .filter((vector): vector is TVectorNode => vector !== null);

  return mergeVectorNodeGeometries(
    glyphVectors,
    { id: nanoid(), name: node.name, parentId: node.parentId, rotation: node.rotation },
    node.fill,
  );
};
