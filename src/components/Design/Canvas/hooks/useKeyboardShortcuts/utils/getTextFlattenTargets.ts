// others
import { MSDF_ATLAS_JSON } from 'constant/webgl/msdfAtlas';

// store
import { selectActivePage, selectSelectedNodes } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TTextNode, TVectorNode } from 'types/design/types';

// utils
import { getTextFlattenVector } from 'utils/canvas/text/fontOutline/getTextFlattenVector';

export type TTextFlattenTarget = { node: TTextNode; vector: TVectorNode };

export const getTextFlattenTargets = async (): Promise<TTextFlattenTarget[]> => {
  const { nodes } = selectActivePage(store.getState());
  const textNodes = selectSelectedNodes(store.getState()).filter((node): node is TTextNode => node.type === NodeType.text);
  const targets = await Promise.all(
    textNodes.map(async (node) => ({
      node,
      vector: await getTextFlattenVector(MSDF_ATLAS_JSON, node, node.pathId ? nodes[node.pathId] : undefined),
    })),
  );

  return targets.filter((target): target is TTextFlattenTarget => target.vector !== null);
};
