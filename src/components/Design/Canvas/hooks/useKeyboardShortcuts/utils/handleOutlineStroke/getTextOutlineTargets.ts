// others
import { MSDF_ATLAS_JSON } from 'constant/webgl/msdfAtlas';

// store
import { selectSelectedNodes } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TTextNode } from 'types/design/types';
import { TTextOutlineTarget } from './types';

// utils
import { getTextOutlineAsStrokeVector } from 'utils/canvas/text/fontOutline/getTextOutlineAsStrokeVector';

export const getTextOutlineTargets = async (): Promise<TTextOutlineTarget[]> => {
  const textNodes = selectSelectedNodes(store.getState()).filter(
    (node): node is TTextNode => node.type === NodeType.text && !node.pathId && Boolean(node.strokeColor) && Boolean(node.strokeWidth),
  );

  const targets = await Promise.all(
    textNodes.map(async (node) => ({ node, outline: await getTextOutlineAsStrokeVector(MSDF_ATLAS_JSON, node) })),
  );

  return targets.filter((target): target is TTextOutlineTarget => target.outline !== null);
};
