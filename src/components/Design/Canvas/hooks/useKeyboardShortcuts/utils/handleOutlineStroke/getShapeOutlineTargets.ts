// store
import { selectSelectedNodes } from 'store/design/selectors';
import { store } from 'store';

// types
import { TShapeOutlineTarget } from './types';

// utils
import { getNodeOutlineAsStrokeVector } from 'utils/canvas/vectorNetwork/getNodeStrokeOutline/getNodeOutlineAsStrokeVector';
import { isStrokeableNode } from 'utils/canvas/vectorNetwork/getNodeStrokeOutline/isStrokeableNode';

export const getShapeOutlineTargets = (): TShapeOutlineTarget[] =>
  selectSelectedNodes(store.getState())
    .filter(isStrokeableNode)
    .map((node) => ({ node, outline: getNodeOutlineAsStrokeVector(node) }))
    .filter((target): target is TShapeOutlineTarget => target.outline !== null);
