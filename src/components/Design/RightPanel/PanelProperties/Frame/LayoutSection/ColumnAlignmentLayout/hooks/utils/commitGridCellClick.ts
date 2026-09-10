// store
import { AppDispatch } from 'store';

// types
import { TActiveCell } from '../../GridArea/GridAreaPopover/CellsInput/types';
import { TFrameNode, TSceneNode } from 'types/design/types';

// utils
import { commitGridColumnCountChange } from './commitGridColumnCountChange';
import { commitGridRepackedAnchors } from './commitGridRepackedAnchors';
import { commitGridRowCountChange } from './commitGridRowCountChange';
import { commitGridSpanReset } from './commitGridSpanReset';
import { resolveGridResize } from 'store/design/utils/autoLayout/getGridResizeRepack';

export const commitGridCellClick = (
  dispatch: AppDispatch,
  frameNode: TFrameNode | undefined,
  nodes: Record<string, TSceneNode>,
  cell: TActiveCell,
): void => {
  if (frameNode) {
    const resolution = resolveGridResize(frameNode, nodes, cell.columns, cell.rows);

    if (resolution.ok) {
      commitGridColumnCountChange(dispatch, frameNode, cell.columns);
      commitGridRowCountChange(dispatch, frameNode, cell.rows);
      commitGridSpanReset(dispatch, resolution.spanReset);
      commitGridRepackedAnchors(dispatch, resolution.repacked);
    }
  }
};
