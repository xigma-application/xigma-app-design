// store
import { AppDispatch } from 'store';

// types
import { TFrameNode, TSceneNode } from 'types/design/types';

// utils
import { clampGridCount } from './clampGridCount';
import { commitGridRepackedAnchors } from './commitGridRepackedAnchors';
import { commitGridRowCountChange } from './commitGridRowCountChange';
import { commitGridSpanReset } from './commitGridSpanReset';
import { getDerivedGridRowCount } from 'store/design/utils/autoLayout/getDerivedGridRowCount';
import { resolveGridResize } from 'store/design/utils/autoLayout/getGridResizeRepack';

export const commitGridRowResize = (
  dispatch: AppDispatch,
  frameNode: TFrameNode | undefined,
  nodes: Record<string, TSceneNode>,
  columnCount: number,
  raw: string,
): void => {
  const next = clampGridCount(raw);
  const current = frameNode ? Math.max(Math.round(frameNode.gridRowCount ?? getDerivedGridRowCount(frameNode, nodes)), 1) : null;

  if (next !== null && frameNode && next !== current) {
    const resolution = resolveGridResize(frameNode, nodes, columnCount, next);

    if (resolution.ok) {
      commitGridRowCountChange(dispatch, frameNode, next);
      commitGridSpanReset(dispatch, resolution.spanReset);
      commitGridRepackedAnchors(dispatch, resolution.repacked);
    }
  }
};
