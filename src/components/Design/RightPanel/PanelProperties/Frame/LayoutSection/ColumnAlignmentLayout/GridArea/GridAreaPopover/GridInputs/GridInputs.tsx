import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// @xigma
import { Icon } from '@xigma/components';

// components
import E2EDataAttribute from 'shared/E2EDataAttributes/E2EDataAttribute';
import GridInputCells from './GridInputCells';
import GridRowsModeMenu from './GridRowsModeMenu';
import { UITools } from 'shared';

// others
import { translationNameSpace } from '../../../constants';

// styles
import styles from './grid-inputs.module.scss';

// types
import { E2EAttribute } from 'types/e2e';

export type TGridInputsProps = {
  columns: string;
  isRowsAuto: boolean;
  onCommitColumns: TFunc<[string]>;
  onCommitRows: TFunc<[string]>;
  onSetRowsAuto: TFunc;
  onSetRowsFixed: TFunc;
  rows: string;
};

export const GridInputs: FC<TGridInputsProps> = ({
  columns,
  isRowsAuto,
  onCommitColumns,
  onCommitRows,
  onSetRowsAuto,
  onSetRowsFixed,
  rows,
}) => {
  const { t } = useTranslation();

  return (
    <E2EDataAttribute type={E2EAttribute.gridInputs} value="">
      <div className={styles.GridInputs}>
        <div className={styles.GridInputs__field}>
          <GridInputCells iconName="Columns" onCommit={onCommitColumns} value={columns} />
        </div>
        <span className={styles.GridInputs__separator}>×</span>
        <div className={styles.GridInputs__field}>
          <GridInputCells
            endAdornment={
              <UITools.ButtonMenu
                trigger={<Icon name="ChevronDown" size={10} />}
                triggerAriaLabel={t(`${translationNameSpace}.grid.rowsModeMenuAriaLabel`)}
              >
                <GridRowsModeMenu isAuto={isRowsAuto} onSetAuto={onSetRowsAuto} onSetFixed={onSetRowsFixed} value={rows} />
              </UITools.ButtonMenu>
            }
            iconName="Rows"
            onCommit={onCommitRows}
            value={isRowsAuto ? t(`${translationNameSpace}.grid.rowsAuto`) : rows}
          />
        </div>
      </div>
    </E2EDataAttribute>
  );
};

export default GridInputs;
