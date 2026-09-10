import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import CellsInput from './CellsInput/CellsInput';
import GridInputs from './GridInputs/GridInputs';
import { UITools } from 'shared';

// hooks
import { TUseColumnGridAreaResult } from '../../hooks/useColumnGridArea';

// others
import { translationNameSpace } from '../../constants';

// styles
import styles from './grid-area-popover.module.scss';

export type TGridAreaPopoverProps = {
  close: TFunc;
  grid: TUseColumnGridAreaResult;
};

export const GridAreaPopover: FC<TGridAreaPopoverProps> = ({ close, grid }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.GridAreaPopover}>
      <GridInputs
        columns={grid.columns}
        isRowsAuto={grid.isRowsAuto}
        onCommitColumns={grid.onCommitColumns}
        onCommitRows={grid.onCommitRows}
        onSetRowsAuto={grid.onSetRowsAuto}
        onSetRowsFixed={grid.onSetRowsFixed}
        rows={grid.rows}
      />
      <CellsInput close={close} columns={grid.columns} onClickCell={grid.onClickCell} rows={grid.rows} />
      <UITools.Button
        className={styles['GridAreaPopover__settings-button']}
        onClick={() => {
          grid.onOpenSettings();
          close();
        }}
        size="medium"
        variant="outline"
      >
        {t(`${translationNameSpace}.grid.openSettings`)}
      </UITools.Button>
    </div>
  );
};

export default GridAreaPopover;
