import { FC, FocusEvent } from 'react';

// @xigma
import { ScrubbableInput, Tooltip } from '@xigma/components';

// components
import { TextField } from 'shared';

// others
import { POSITION_MAX, POSITION_MIN } from '../constants';

// styles
import styles from './column-position-field.module.scss';

// types
import { TE2EValue } from 'shared/E2EDataAttributes/types';

export type TColumnPositionFieldProps = {
  ariaLabel: string;
  e2eValue: TE2EValue;
  label: string;
  onBlur: TFunc<[FocusEvent<HTMLInputElement>]>;
  onDragEnd: TFunc;
  onDragStart: TFunc;
  onScrub: TFunc<[number]>;
  tooltip: string;
  value: number;
};

export const ColumnPositionField: FC<TColumnPositionFieldProps> = ({
  ariaLabel,
  e2eValue,
  label,
  onBlur,
  onDragEnd,
  onDragStart,
  onScrub,
  tooltip,
  value,
}) => (
  <Tooltip content={tooltip}>
    <TextField
      aria-label={ariaLabel}
      defaultValue={value}
      e2eValue={e2eValue}
      onBlur={onBlur}
      startAdornment={
        <ScrubbableInput
          max={POSITION_MAX}
          min={POSITION_MIN}
          onChange={onScrub}
          onMouseDown={onDragStart}
          onMouseUp={onDragEnd}
          value={value}
        >
          <span className={styles.ColumnPositionField__label}>{label}</span>
        </ScrubbableInput>
      }
      type="number"
    />
  </Tooltip>
);

export default ColumnPositionField;
