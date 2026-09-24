// store
import { selectNodes, selectRenderOrderedNodes, selectSelectedNodes } from 'store/design/selectors';
import { store } from 'store';

// types
import { TFlattenEntry } from './types';
import { TTextFlattenTarget } from '../getTextFlattenTargets';

// utils
import { getFlattenOperandVector } from 'utils/canvas/flatten/getFlattenOperandVector';

export const getFlattenEntries = (textTargets: TTextFlattenTarget[]): TFlattenEntry[] => {
  const state = store.getState();
  const nodesById = selectNodes(state);
  const renderIndexById = new Map(selectRenderOrderedNodes(state).map((node, index) => [node.id, index]));
  const shapeEntries = selectSelectedNodes(state).flatMap((node) => {
    const vector = getFlattenOperandVector(node, nodesById);
    return vector ? [{ node, renderIndex: renderIndexById.get(node.id) ?? 0, vector }] : [];
  });
  const textEntries = textTargets.map(({ node, vector }) => ({ node, renderIndex: renderIndexById.get(node.id) ?? 0, vector }));

  return [...shapeEntries, ...textEntries].sort((entryA, entryB) => entryA.renderIndex - entryB.renderIndex);
};
