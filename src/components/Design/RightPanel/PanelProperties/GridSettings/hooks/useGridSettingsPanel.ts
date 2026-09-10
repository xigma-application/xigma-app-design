// store
import { selectNodes, selectSelectedNodes } from 'store/design/selectors';
import { setGridSettingsPanelOpen } from 'store/design/slice';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { TGridAxisControls } from './types';

// utils
import { buildGridTrackList } from 'store/design/utils/autoLayout/gridTracks/buildGridTrackList';
import { getDerivedGridRowCount } from 'store/design/utils/autoLayout/getDerivedGridRowCount';
import { getSelectedGridFrame } from 'store/design/utils/autoLayout/getSelectedGridFrame';
import { makeAxisControls } from './utils/makeAxisControls/makeAxisControls';

export type TUseGridSettingsPanelResult = {
  columns: TGridAxisControls;
  frameId: string | null;
  onClose: TFunc;
  rows: TGridAxisControls;
};

const NOOP_CONTROLS: TGridAxisControls = {
  onAdd: () => undefined,
  onChangeMode: () => undefined,
  onChangeValue: () => undefined,
  onDelete: () => undefined,
  onReorder: () => null,
  revision: null,
  tracks: [],
};

export const useGridSettingsPanel = (): TUseGridSettingsPanelResult => {
  const dispatch = useAppDispatch();
  const nodes = useAppSelector(selectNodes);
  const selectedNodes = useAppSelector(selectSelectedNodes);
  const frame = getSelectedGridFrame(selectedNodes);

  const onClose = (): void => {
    dispatch(setGridSettingsPanelOpen(false));
  };

  if (frame) {
    const columnCount = Math.max(Math.round(frame.gridColumnCount ?? 1), 1);
    const rowCount = Math.max(Math.round(frame.gridRowCount ?? getDerivedGridRowCount(frame, nodes)), 1);
    const columnTracks = buildGridTrackList(columnCount, frame.gridColumnSizes);
    const rowTracks = buildGridTrackList(rowCount, frame.gridRowSizes);

    return {
      columns: makeAxisControls(dispatch, frame, nodes, 'column', columnTracks),
      frameId: frame.id,
      onClose,
      rows: makeAxisControls(dispatch, frame, nodes, 'row', rowTracks),
    };
  }

  return { columns: NOOP_CONTROLS, frameId: null, onClose, rows: NOOP_CONTROLS };
};
