// store
import { selectNodes, selectSelectedNodes } from 'store/design/selectors';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TActiveCell } from '../GridArea/GridAreaPopover/CellsInput/types';

// utils
import { clampGridCount } from './utils/clampGridCount';
import { commitGridColumnCountChange } from './utils/commitGridColumnCountChange';
import { commitGridRepackedAnchors } from './utils/commitGridRepackedAnchors';
import { commitGridRowCountChange } from './utils/commitGridRowCountChange';
import { commitGridRowsAuto } from './utils/commitGridRowsAuto';
import { commitGridSpanReset } from './utils/commitGridSpanReset';
import { getDerivedGridRowCount } from 'store/design/utils/autoLayout/getDerivedGridRowCount';
import { resolveGridResize } from 'store/design/utils/autoLayout/getGridResizeRepack';

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
  const columnCount = Math.max(frameNode?.gridColumnCount ?? 1, 1);
  const isRowsAuto = frameNode?.gridRowCount === undefined;
  const rowCount = frameNode ? (frameNode.gridRowCount ?? getDerivedGridRowCount(frameNode, nodes)) : 1;

  const onCommitColumns = (raw: string): void => {
    const next = clampGridCount(raw);

    if (next !== null && frameNode) {
      const capacityRowCount = isRowsAuto ? undefined : rowCount;
      const resolution = resolveGridResize(frameNode, nodes, next, capacityRowCount);

      if (resolution.ok) {
        commitGridColumnCountChange(dispatch, frameNode, next);
        commitGridSpanReset(dispatch, resolution.spanReset);
        commitGridRepackedAnchors(dispatch, resolution.repacked);
      }
    }
  };

  const onCommitRows = (raw: string): void => {
    const next = clampGridCount(raw);

    if (next !== null && frameNode) {
      const resolution = resolveGridResize(frameNode, nodes, columnCount, next);

      if (resolution.ok) {
        commitGridRowCountChange(dispatch, frameNode, next);
        commitGridSpanReset(dispatch, resolution.spanReset);
        commitGridRepackedAnchors(dispatch, resolution.repacked);
      }
    }
  };

  const onSetRowsAuto = (): void => {
    commitGridRowsAuto(dispatch, frameNode);
  };

  const onSetRowsFixed = (): void => {
    commitGridRowCountChange(dispatch, frameNode, rowCount);
  };

  const onClickCell = (cell: TActiveCell): void => {
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
