import { FC, FocusEvent } from 'react';

// @xigma
import { ScrubbableInput, TIconProps, Tooltip } from '@xigma/components';

// components
import { UITools } from 'shared';

// others
import { SPACING_MAX, SPACING_MIN } from './constants';

// types
import { TE2EValue } from 'shared/E2EDataAttributes/types';

export type TColumnSpacingFieldProps = {
  ariaLabel: string;
  displayValue: number | string;
  e2eValue: TE2EValue;
  icon: TIconProps['name'];
  onBlur: TFunc<[FocusEvent<HTMLInputElement>]>;
  onDragEnd: TFunc;
  onDragStart: TFunc;
  onScrub: TFunc<[number]>;
  tooltip: string;
  value: number;
};

export const ColumnSpacingField: FC<TColumnSpacingFieldProps> = ({
  ariaLabel,
  displayValue,
  e2eValue,
  icon,
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
      e2eValue={e2eValue}
      onBlur={onBlur}
      stepNumbers={{ max: SPACING_MAX, min: SPACING_MIN }}
      startAdornment={
        <ScrubbableInput
          max={SPACING_MAX}
          min={SPACING_MIN}
          onChange={onScrub}
          onMouseDown={onDragStart}
          onMouseUp={onDragEnd}
          value={value}
        >
          <UITools.InputAdornment icon={icon} />
        </ScrubbableInput>
      }
      type={typeof displayValue === 'number' ? 'number' : 'text'}
    />
  </Tooltip>
);

export default ColumnSpacingField;
