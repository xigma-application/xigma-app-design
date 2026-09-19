import { FC, FocusEvent } from 'react';

// @xigma
import { ScrubbableInput, TIconProps } from '@xigma/components';

// components
import { UITools } from 'shared';

// others
import { STROKE_WEIGHT_MAX, STROKE_WEIGHT_MIN } from '../constants';

export type TStrokeWeightFieldProps = {
  ariaLabel: string;
  displayValue: string;
  e2eValue?: string;
  icon?: TIconProps['name'];
  onBlur: TFunc<[FocusEvent<HTMLInputElement>]>;
  onDragEnd: TFunc;
  onDragStart: TFunc;
  onScrub: TFunc<[number]>;
  scrubValue: number;
};

export const StrokeWeightField: FC<TStrokeWeightFieldProps> = ({
  ariaLabel,
  displayValue,
  e2eValue = 'stroke-weight',
  icon = 'Weight',
  onBlur,
  onDragEnd,
  onDragStart,
  onScrub,
  scrubValue,
}) => (
  <UITools.TextField
    aria-label={ariaLabel}
    defaultValue={displayValue}
    e2eValue={e2eValue}
    onBlur={onBlur}
    stepNumbers={{ max: STROKE_WEIGHT_MAX, min: STROKE_WEIGHT_MIN }}
    startAdornment={
      <ScrubbableInput
        max={STROKE_WEIGHT_MAX}
        min={STROKE_WEIGHT_MIN}
        onChange={onScrub}
        onMouseDown={onDragStart}
        onMouseUp={onDragEnd}
        value={scrubValue}
      >
        <UITools.InputAdornment icon={icon} />
      </ScrubbableInput>
    }
    type="text"
  />
);

export default StrokeWeightField;
