import cx from 'classnames';
import { FC } from 'react';

// @xigma
import { Tooltip } from '@xigma/components';

// components
import E2EDataAttribute from 'shared/E2EDataAttributes/E2EDataAttribute';

// hooks
import { useCellsInput } from './hooks/useCellsInput';

// others
import { getAttributes } from 'shared/E2EDataAttributes/utils/getAttributes';
import { PICKER_COLUMNS, PICKER_ROWS, SEPARATOR } from './constants';

// styles
import styles from './cells-input.module.scss';

// types
import { E2EAttribute } from 'types/e2e';
import { TActiveCell } from './types';

export type TCellsInputProps = {
  close: TFunc;
  columns: string;
  onClickCell: TFunc<[TActiveCell]>;
  rows: string;
};

export const CellsInput: FC<TCellsInputProps> = ({ close, columns, onClickCell, rows }) => {
  const parsedColumns = parseInt(columns, 10) || 0;
  const parsedRows = parseInt(rows, 10) || 0;
  const { activeCell, ...events } = useCellsInput(onClickCell, close);

  return (
    <E2EDataAttribute type={E2EAttribute.gridCellsInput} value="">
      <div
        className={styles.CellsInput}
        style={{
          gridTemplateColumns: `repeat(${PICKER_COLUMNS}, 1fr)`,
          gridTemplateRows: `repeat(${PICKER_ROWS}, 1fr)`,
        }}
        {...events}
      >
        {Array.from({ length: PICKER_ROWS }, (_row, row) =>
          Array.from({ length: PICKER_COLUMNS }, (_column, column) => {
            const targetColumn = column + 1;
            const targetRow = row + 1;

            return (
              <Tooltip content={`${targetColumn}x${targetRow}`} key={`${targetColumn}-${targetRow}`}>
                <button
                  className={cx(styles.CellsInput__cell, {
                    [styles['CellsInput__cell--active']]: targetColumn <= activeCell.columns && targetRow <= activeCell.rows,
                    [styles['CellsInput__cell--selected']]: targetColumn <= parsedColumns && targetRow <= parsedRows,
                  })}
                  data-value={`${targetColumn}${SEPARATOR}${targetRow}`}
                  type="button"
                  {...getAttributes(E2EAttribute.gridCellInput, row * PICKER_COLUMNS + column)}
                />
              </Tooltip>
            );
          }),
        )}
      </div>
    </E2EDataAttribute>
  );
};

export default CellsInput;
