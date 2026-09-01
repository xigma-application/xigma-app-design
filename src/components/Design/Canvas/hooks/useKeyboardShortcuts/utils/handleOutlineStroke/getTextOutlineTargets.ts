// others
import { MSDF_ATLAS_JSON } from 'constant/webgl/msdfAtlas';

// store
import { selectActivePage, selectSelectedNodes } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TTextNode } from 'types/design/types';
import { TTextOutlineTarget } from './types';

// utils
import { getTextOutlineAsStrokeGlyphVectors } from 'utils/canvas/text/fontOutline/getTextOutlineAsStrokeGlyphVectors';

export const getTextOutlineTargets = async (): Promise<TTextOutlineTarget[]> => {
  const { nodes } = selectActivePage(store.getState());
  const textNodes = selectSelectedNodes(store.getState()).filter((node): node is TTextNode => node.type === NodeType.text);

  const targets = await Promise.all(
    textNodes.map(async (node) => ({
      letters: await getTextOutlineAsStrokeGlyphVectors(MSDF_ATLAS_JSON, node, node.pathId ? nodes[node.pathId] : undefined),
      node,
    })),
  );

  return targets.filter((target): target is TTextOutlineTarget => target.letters.length > 0);
};
