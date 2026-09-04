import { FC } from 'react';

// @xigma
import { ScrubbableInput } from '@xigma/components';

// components
import { TextField } from 'shared';

// hooks
import { useAlphaCommit } from './hooks/useAlphaCommit';

// styles
import styles from './column-background.module.scss';

export type TColumnBackgroundAlphaFieldProps = { alpha: number; onCommit: TFunc<[number]> };

export const ColumnBackgroundAlphaField: FC<TColumnBackgroundAlphaFieldProps> = ({ alpha, onCommit }) => {
  const onBlur = useAlphaCommit(alpha, onCommit);
  const rounded = Math.round(alpha);

  return (
    <TextField
      className={styles.ColumnBackground__alpha}
      defaultValue={rounded}
      e2eValue="background-alpha"
      endAdornment={
        <ScrubbableInput max={100} min={0} onChange={onCommit} value={rounded}>
          <span className={styles.ColumnBackground__unit}>%</span>
        </ScrubbableInput>
      }
      key={alpha}
      max={100}
      min={0}
      onBlur={onBlur}
      type="number"
    />
  );
};

export default ColumnBackgroundAlphaField;
