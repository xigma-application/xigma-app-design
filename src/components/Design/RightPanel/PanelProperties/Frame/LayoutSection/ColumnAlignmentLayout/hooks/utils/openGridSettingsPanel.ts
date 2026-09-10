// store
import { setGridSettingsPanelOpen, updateNode } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { TFrameNode } from 'types/design/types';

export const openGridSettingsPanel = (dispatch: AppDispatch, frameNode: TFrameNode | undefined, rowCount: number): void => {
  if (frameNode) {
    if (frameNode.gridRowCount === undefined) {
      dispatch(updateNode({ changes: { gridRowCount: rowCount }, id: frameNode.id }));
    }

    dispatch(setGridSettingsPanelOpen(true));
  }
};
