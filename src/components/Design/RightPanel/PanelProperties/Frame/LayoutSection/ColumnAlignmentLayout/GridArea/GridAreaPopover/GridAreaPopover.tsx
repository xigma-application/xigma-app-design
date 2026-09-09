import { FC } from 'react';

// components
import CellsInput from './CellsInput/CellsInput';
import GridInputs from './GridInputs/GridInputs';

// styles
import styles from './grid-area-popover.module.scss';

// types
import { TActiveCell } from './CellsInput/types';

export type TGridAreaPopoverProps = {
  close: TFunc;
  columns: string;
  onClickCell: TFunc<[TActiveCell]>;
  onCommitColumns: TFunc<[string]>;
  onCommitRows: TFunc<[string]>;
  rows: string;
};

export const GridAreaPopover: FC<TGridAreaPopoverProps> = ({ close, columns, onClickCell, onCommitColumns, onCommitRows, rows }) => (
  <div className={styles.GridAreaPopover}>
    <GridInputs columns={columns} onCommitColumns={onCommitColumns} onCommitRows={onCommitRows} rows={rows} />
    <CellsInput close={close} columns={columns} onClickCell={onClickCell} rows={rows} />
  </div>
);

export default GridAreaPopover;
