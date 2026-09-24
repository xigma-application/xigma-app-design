import { FC, FocusEvent } from 'react';

// @xigma
import { ScrubbableInput, Tooltip } from '@xigma/components';

// components
import { UITools } from 'shared';

// others
import { POSITION_MAX, POSITION_MIN } from '../constants';

// types
import { TE2EValue } from 'shared/E2EDataAttributes/types';

export type TColumnPositionFieldProps = {
  ariaLabel: string;
  disabled?: boolean;
  displayValue: number | string;
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
  disabled = false,
  displayValue,
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
    <UITools.TextField
      aria-label={ariaLabel}
      defaultValue={displayValue}
      disabled={disabled}
      e2eValue={e2eValue}
      onBlur={onBlur}
      stepNumbers={{ max: POSITION_MAX, min: POSITION_MIN }}
      startAdornment={
        <ScrubbableInput
          disabled={disabled}
          max={POSITION_MAX}
          min={POSITION_MIN}
          onChange={onScrub}
          onMouseDown={onDragStart}
          onMouseUp={onDragEnd}
          value={value}
        >
          <UITools.InputAdornment label={label} />
        </ScrubbableInput>
      }
      type={typeof displayValue === 'number' ? 'number' : 'text'}
    />
  </Tooltip>
);

export default ColumnPositionField;
