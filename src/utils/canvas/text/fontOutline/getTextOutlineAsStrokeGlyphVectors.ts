import { nanoid } from '@reduxjs/toolkit';

// types
import { TGlyphAtlasJson } from 'types/msdf';
import { TPoint } from 'types/canvas';
import { TSceneNode, TTextNode, TVectorNode } from 'types/design/types';

// utils
import { getCurvedTextGlyphContours } from './getCurvedTextGlyphContours';
import { getGlyphFillVectors } from './getGlyphFillVectors';
import { getGlyphStrokeVectors } from './getGlyphStrokeVectors';
import { getTextGlyphContours } from './getTextGlyphContours';
import { getVectorNodeBounds } from 'utils/canvas/vectorNetwork/getVectorNodeBounds';
import { mergeVectorNodeGeometries } from 'utils/canvas/vectorNetwork/buildVectorNodeFromLoops/mergeVectorNodeGeometries';
import { rotateVectorNodeOrigin } from 'components/Design/Canvas/utils/rotateVectorNodeOrigin';

const bakeSharedRotation = (letters: TVectorNode[], degrees: number): TVectorNode[] => {
  if (!degrees) {
    return letters;
  }

  const bounds = letters.map(getVectorNodeBounds);
  const minX = Math.min(...bounds.map((b) => b.x));
  const minY = Math.min(...bounds.map((b) => b.y));
  const maxX = Math.max(...bounds.map((b) => b.x + b.width));
  const maxY = Math.max(...bounds.map((b) => b.y + b.height));
  const pivot: TPoint = { x: (minX + maxX) / 2, y: (minY + maxY) / 2 };

  return letters.map((letter) => ({ ...letter, rotation: 0, ...rotateVectorNodeOrigin(letter, pivot, degrees) }));
};

export const getTextOutlineAsStrokeGlyphVectors = async (
  atlas: TGlyphAtlasJson,
  node: TTextNode,
  pathNode?: TSceneNode,
): Promise<TVectorNode[]> => {
  if (!(node.pathId && !pathNode)) {
    const glyphContours = node.pathId ? await getCurvedTextGlyphContours(atlas, node, pathNode) : await getTextGlyphContours(atlas, node);
    const fillVectors = getGlyphFillVectors(glyphContours, node.fill);
    const strokeWidth = node.strokeWidth ?? 0;
    const hasStroke = Boolean(node.strokeColor) && strokeWidth > 0;
    const strokeVectors = hasStroke
      ? getGlyphStrokeVectors(glyphContours, strokeWidth / 2, node.strokeColor as string)
      : glyphContours.map(() => null);

    const letters = glyphContours
      .map((_, index) => {
        const parts = [fillVectors[index], strokeVectors[index]].filter((vector): vector is TVectorNode => Boolean(vector));

        if (parts.length === 0) {
          return null;
        }

        return mergeVectorNodeGeometries(parts, { id: nanoid(), name: node.name, parentId: null, rotation: 0 }, node.fill);
      })
      .filter((vector): vector is TVectorNode => vector !== null);

    return bakeSharedRotation(letters, node.rotation);
  }

  return [];
};
