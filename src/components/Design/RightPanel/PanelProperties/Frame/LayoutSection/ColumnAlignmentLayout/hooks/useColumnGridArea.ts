// others
import { EMPTY_VECTOR_SELECTION_SNAPSHOT } from 'store/history/constants';
import { MIXED_LABEL } from 'components/Design/RightPanel/PanelProperties/Common/constants';

// store
import { beginHistoryGesture, endHistoryGesture } from 'store/history/actions';
import { selectNodes, selectSelectedNodes } from 'store/design/selectors';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TActiveCell } from '../GridArea/GridAreaPopover/CellsInput/types';
import { TFrameNode } from 'types/design/types';

// utils
import { clampGridCount } from './utils/clampGridCount';
import { commitGridCellClick } from './utils/commitGridCellClick';
import { commitGridColumnResize } from './utils/commitGridColumnResize';
import { commitGridRowCountChange } from './utils/commitGridRowCountChange';
import { commitGridRowResize } from './utils/commitGridRowResize';
import { commitGridRowsAuto } from './utils/commitGridRowsAuto';
import { commitGridSizeToFrames } from './utils/commitGridSizeToFrames';
import { fitGridTrackCount } from './utils/fitGridTrackCount';
import { isGridFrameNode } from 'utils/canvas/signals/isGridFrameNode';
import { isGridRowsAuto } from './utils/isGridRowsAuto';
import { getDerivedGridRowCount } from 'store/design/utils/autoLayout/getDerivedGridRowCount';
import { openGridSettingsPanel } from './utils/openGridSettingsPanel';

export type TUseColumnGridAreaResult = {
  canOpenSettings: boolean;
  columns: string;
  isMixed: boolean;
  isRowsAuto: boolean;
  onClickCell: TFunc<[TActiveCell]>;
  onCommitColumns: TFunc<[string]>;
  onCommitRows: TFunc<[string]>;
  onOpenSettings: TFunc;
  onSetRowsAuto: TFunc;
  onSetRowsFixed: TFunc;
  rows: string;
};

export const useColumnGridArea = (): TUseColumnGridAreaResult => {
  const dispatch = useAppDispatch();
  const nodes = useAppSelector(selectNodes);
  const selectedNodes = useAppSelector(selectSelectedNodes);
  const [selectedNode] = selectedNodes;
  const frameNode = selectedNode?.type === NodeType.frame ? selectedNode : undefined;
  const gridFrames = selectedNodes.filter(isGridFrameNode);
  const isMultiSelection = gridFrames.length > 1;
  const getColumnCount = (frame: TFrameNode): number => Math.max(frame.gridColumnCount ?? 1, 1);
  const getRowCount = (frame: TFrameNode): number => frame.gridRowCount ?? getDerivedGridRowCount(frame, nodes);
  const columnCount = frameNode ? getColumnCount(frameNode) : 1;
  const rowCount = frameNode ? getRowCount(frameNode) : 1;
  const isRowsAuto = isGridRowsAuto(isMultiSelection ? gridFrames : frameNode ? [frameNode] : []);
  const isColumnsMixed = isMultiSelection && gridFrames.some((frame) => getColumnCount(frame) !== columnCount);
  const isRowsMixed = isMultiSelection && gridFrames.some((frame) => getRowCount(frame) !== rowCount);
  const requiredCells = Math.max(0, ...gridFrames.map((frame) => frame.childIds.length));

  const commitMulti = (raw: string, getSize: TFunc<[TFrameNode, number], { columns: number; rows: number | undefined }>): void => {
    const next = clampGridCount(raw);

    if (next !== null) {
      commitGridSizeToFrames(dispatch, gridFrames, nodes, (frame) => getSize(frame, next));
    }
  };

  const runOnGridFrames = (commit: TFunc<[TFrameNode]>): void => {
    dispatch(beginHistoryGesture(EMPTY_VECTOR_SELECTION_SNAPSHOT));
    gridFrames.forEach(commit);
    dispatch(endHistoryGesture());
  };

  if (isMultiSelection) {
    return {
      canOpenSettings: false,
      columns: isColumnsMixed ? MIXED_LABEL : columnCount.toString(),
      isMixed: isColumnsMixed || isRowsMixed,
      isRowsAuto,
      onClickCell: (cell) =>
        commitGridSizeToFrames(dispatch, gridFrames, nodes, () => ({
          columns: cell.columns,
          rows: fitGridTrackCount(cell.columns, cell.rows, requiredCells),
        })),
      onCommitColumns: (raw) =>
        commitMulti(raw, (frame, next) => ({
          columns: next,
          rows: frame.gridRowCount === undefined ? undefined : fitGridTrackCount(next, getRowCount(frame), requiredCells),
        })),
      onCommitRows: (raw) =>
        commitMulti(raw, (frame, next) => ({ columns: fitGridTrackCount(next, getColumnCount(frame), requiredCells), rows: next })),
      onOpenSettings: () => undefined,
      onSetRowsAuto: () => runOnGridFrames((frame) => commitGridRowsAuto(dispatch, frame)),
      onSetRowsFixed: () => runOnGridFrames((frame) => commitGridRowCountChange(dispatch, frame, getRowCount(frame))),
      rows: isRowsMixed ? MIXED_LABEL : rowCount.toString(),
    };
  }

  return {
    canOpenSettings: true,
    columns: columnCount.toString(),
    isMixed: false,
    isRowsAuto,
    onClickCell: (cell) => commitGridCellClick(dispatch, frameNode, nodes, cell),
    onCommitColumns: (raw) => commitGridColumnResize(dispatch, frameNode, nodes, raw, isRowsAuto ? undefined : rowCount),
    onCommitRows: (raw) => commitGridRowResize(dispatch, frameNode, nodes, columnCount, raw),
    onOpenSettings: () => openGridSettingsPanel(dispatch, frameNode, rowCount),
    onSetRowsAuto: () => commitGridRowsAuto(dispatch, frameNode),
    onSetRowsFixed: () => commitGridRowCountChange(dispatch, frameNode, rowCount),
    rows: rowCount.toString(),
  };
};
