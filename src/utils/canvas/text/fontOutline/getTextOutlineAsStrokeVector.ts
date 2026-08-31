// types
import { TGlyphAtlasJson } from 'types/msdf';
import { TTextNode, TVectorNode } from 'types/design/types';

// utils
import { getTextFlattenVector } from './getTextFlattenVector';
import { getTextStrokeOutlineVector } from './getTextStrokeOutlineVector';
import { mergeVectorNodeGeometries } from 'utils/canvas/vectorNetwork/buildVectorNodeFromLoops/mergeVectorNodeGeometries';

export const getTextOutlineAsStrokeVector = async (atlas: TGlyphAtlasJson, node: TTextNode): Promise<TVectorNode | null> => {
  const [fillVector, strokeVector] = await Promise.all([getTextFlattenVector(atlas, node), getTextStrokeOutlineVector(atlas, node)]);
  const parts = [fillVector, strokeVector].filter((vector): vector is TVectorNode => vector !== null);

  return mergeVectorNodeGeometries(parts, { id: node.id, name: node.name, parentId: node.parentId, rotation: node.rotation }, node.fill);
};
