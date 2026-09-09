import { FC } from 'react';

// components
import E2EDataAttribute from 'shared/E2EDataAttributes/E2EDataAttribute';
import GridInputCells from './GridInputCells';

// styles
import styles from './grid-inputs.module.scss';

// types
import { E2EAttribute } from 'types/e2e';

export type TGridInputsProps = {
  columns: string;
  onCommitColumns: TFunc<[string]>;
  onCommitRows: TFunc<[string]>;
  rows: string;
};

export const GridInputs: FC<TGridInputsProps> = ({ columns, onCommitColumns, onCommitRows, rows }) => (
  <E2EDataAttribute type={E2EAttribute.gridInputs} value="">
    <div className={styles.GridInputs}>
      <GridInputCells iconName="Columns" onCommit={onCommitColumns} value={columns} />
      <span className={styles.GridInputs__separator}>×</span>
      <GridInputCells iconName="Rows" onCommit={onCommitRows} value={rows} />
    </div>
  </E2EDataAttribute>
);

export default GridInputs;
