import { FC, FocusEvent } from 'react';

// @xigma
import { ScrubbableInput } from '@xigma/components';

// components
import { UITools } from 'shared';

// others
import { ROTATION_MAX, ROTATION_MIN } from '../constants';

// types
import { TE2EValue } from 'shared/E2EDataAttributes/types';

export type TColumnRotationFieldProps = {
  ariaLabel: string;
  e2eValue: TE2EValue;
  onBlur: TFunc<[FocusEvent<HTMLInputElement>]>;
  onDragEnd: TFunc;
  onDragStart: TFunc;
  onScrub: TFunc<[number]>;
  value: number;
};

export const ColumnRotationField: FC<TColumnRotationFieldProps> = ({
  ariaLabel,
  e2eValue,
  onBlur,
  onDragEnd,
  onDragStart,
  onScrub,
  value,
}) => (
  <UITools.TextField
    aria-label={ariaLabel}
    defaultValue={`${value}°`}
    e2eValue={e2eValue}
    onBlur={onBlur}
    stepNumbers={{ max: ROTATION_MAX, min: ROTATION_MIN }}
    startAdornment={
      <ScrubbableInput
        loop
        max={ROTATION_MAX}
        min={ROTATION_MIN}
        onChange={onScrub}
        onMouseDown={onDragStart}
        onMouseUp={onDragEnd}
        value={value}
      >
        <UITools.InputAdornment icon="Protractor" />
      </ScrubbableInput>
    }
    type="text"
  />
);

export default ColumnRotationField;
