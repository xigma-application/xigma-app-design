// store
import { selectNodes, selectSelectedNodes } from 'store/design/selectors';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TActiveCell } from '../GridArea/GridAreaPopover/CellsInput/types';

// utils
import { clampGridCount } from './utils/clampGridCount';
import { commitGridColumnCountChange } from './utils/commitGridColumnCountChange';
import { commitGridRowCountChange } from './utils/commitGridRowCountChange';
import { commitGridRowsAuto } from './utils/commitGridRowsAuto';
import { getEffectiveGridRowCount } from 'store/design/utils/autoLayout/getEffectiveGridRowCount';

export type TUseColumnGridAreaResult = {
  columns: string;
  isRowsAuto: boolean;
  onClickCell: TFunc<[TActiveCell]>;
  onCommitColumns: TFunc<[string]>;
  onCommitRows: TFunc<[string]>;
  onSetRowsAuto: TFunc;
  onSetRowsFixed: TFunc;
  rows: string;
};

export const useColumnGridArea = (): TUseColumnGridAreaResult => {
  const dispatch = useAppDispatch();
  const nodes = useAppSelector(selectNodes);
  const [selectedNode] = useAppSelector(selectSelectedNodes);
  const frameNode = selectedNode?.type === NodeType.frame ? selectedNode : undefined;
  const childCount = frameNode?.childIds.filter((childId) => nodes[childId]).length ?? 0;
  const columnCount = Math.max(frameNode?.gridColumnCount ?? 1, 1);
  const isRowsAuto = frameNode?.gridRowCount === undefined;
  const rowCount = frameNode?.gridRowCount ?? getEffectiveGridRowCount(childCount, columnCount);

  const onCommitColumns = (raw: string): void => {
    const next = clampGridCount(raw);

    if (next !== null) {
      commitGridColumnCountChange(dispatch, frameNode, next);
    }
  };

  const onCommitRows = (raw: string): void => {
    const next = clampGridCount(raw);

    if (next !== null) {
      commitGridRowCountChange(dispatch, frameNode, next);
    }
  };

  const onSetRowsAuto = (): void => {
    commitGridRowsAuto(dispatch, frameNode);
  };

  const onSetRowsFixed = (): void => {
    commitGridRowCountChange(dispatch, frameNode, rowCount);
  };

  const onClickCell = (cell: TActiveCell): void => {
    commitGridColumnCountChange(dispatch, frameNode, cell.columns);
    commitGridRowCountChange(dispatch, frameNode, cell.rows);
  };

  return {
    columns: columnCount.toString(),
    isRowsAuto,
    onClickCell,
    onCommitColumns,
    onCommitRows,
    onSetRowsAuto,
    onSetRowsFixed,
    rows: rowCount.toString(),
  };
};
