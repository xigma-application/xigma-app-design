// store
import { selectNodes, selectSelectedNodes } from 'store/design/selectors';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TActiveCell } from '../GridArea/GridAreaPopover/CellsInput/types';

// utils
import { commitGridCellClick } from './utils/commitGridCellClick';
import { commitGridColumnResize } from './utils/commitGridColumnResize';
import { commitGridRowCountChange } from './utils/commitGridRowCountChange';
import { commitGridRowResize } from './utils/commitGridRowResize';
import { commitGridRowsAuto } from './utils/commitGridRowsAuto';
import { getDerivedGridRowCount } from 'store/design/utils/autoLayout/getDerivedGridRowCount';
import { openGridSettingsPanel } from './utils/openGridSettingsPanel';

export type TUseColumnGridAreaResult = {
  columns: string;
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
  const [selectedNode] = useAppSelector(selectSelectedNodes);
  const frameNode = selectedNode?.type === NodeType.frame ? selectedNode : undefined;
  const columnCount = Math.max(frameNode?.gridColumnCount ?? 1, 1);
  const isRowsAuto = frameNode?.gridRowCount === undefined;
  const rowCount = frameNode ? (frameNode.gridRowCount ?? getDerivedGridRowCount(frameNode, nodes)) : 1;

  return {
    columns: columnCount.toString(),
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
