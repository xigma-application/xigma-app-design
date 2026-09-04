import { FC, FocusEvent } from 'react';

// @xigma
import { ScrubbableInput } from '@xigma/components';

// components
import { UITools } from 'shared';

// others
import { DIMENSIONS_MAX, DIMENSIONS_MIN } from '../constants';

// styles
import styles from './column-dimensions-field.module.scss';

// types
import { TE2EValue } from 'shared/E2EDataAttributes/types';

export type TColumnDimensionsFieldProps = {
  ariaLabel: string;
  e2eValue: TE2EValue;
  label: string;
  onBlur: TFunc<[FocusEvent<HTMLInputElement>]>;
  onDragEnd: TFunc;
  onDragStart: TFunc;
  onScrub: TFunc<[number]>;
  value: number;
};

export const ColumnDimensionsField: FC<TColumnDimensionsFieldProps> = ({
  ariaLabel,
  e2eValue,
  label,
  onBlur,
  onDragEnd,
  onDragStart,
  onScrub,
  value,
}) => (
  <UITools.TextField
    aria-label={ariaLabel}
    defaultValue={value}
    e2eValue={e2eValue}
    onBlur={onBlur}
    startAdornment={
      <ScrubbableInput
        max={DIMENSIONS_MAX}
        min={DIMENSIONS_MIN}
        onChange={onScrub}
        onMouseDown={onDragStart}
        onMouseUp={onDragEnd}
        value={value}
      >
        <span className={styles.ColumnDimensionsField__label}>{label}</span>
      </ScrubbableInput>
    }
    type="number"
  />
);

export default ColumnDimensionsField;
