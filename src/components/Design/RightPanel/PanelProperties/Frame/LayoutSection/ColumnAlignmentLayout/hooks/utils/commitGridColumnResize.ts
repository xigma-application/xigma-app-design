// store
import { AppDispatch } from 'store';

// types
import { TFrameNode, TSceneNode } from 'types/design/types';

// utils
import { clampGridCount } from './clampGridCount';
import { commitGridColumnCountChange } from './commitGridColumnCountChange';
import { commitGridRepackedAnchors } from './commitGridRepackedAnchors';
import { commitGridSpanReset } from './commitGridSpanReset';
import { resolveGridResize } from 'store/design/utils/autoLayout/getGridResizeRepack';

export const commitGridColumnResize = (
  dispatch: AppDispatch,
  frameNode: TFrameNode | undefined,
  nodes: Record<string, TSceneNode>,
  raw: string,
  capacityRowCount: number | undefined,
): void => {
  const next = clampGridCount(raw);

  if (next !== null && frameNode && next !== Math.max(Math.round(frameNode.gridColumnCount ?? 1), 1)) {
    const resolution = resolveGridResize(frameNode, nodes, next, capacityRowCount);

    if (resolution.ok) {
      commitGridColumnCountChange(dispatch, frameNode, next);
      commitGridSpanReset(dispatch, resolution.spanReset);
      commitGridRepackedAnchors(dispatch, resolution.repacked);
    }
  }
};
