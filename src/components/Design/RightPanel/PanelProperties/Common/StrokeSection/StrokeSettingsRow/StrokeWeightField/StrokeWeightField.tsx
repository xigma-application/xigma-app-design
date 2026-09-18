import { FC, FocusEvent } from 'react';

// @xigma
import { ScrubbableInput } from '@xigma/components';

// components
import { UITools } from 'shared';

// others
import { STROKE_WEIGHT_MAX, STROKE_WEIGHT_MIN } from '../constants';

export type TStrokeWeightFieldProps = {
  ariaLabel: string;
  onBlur: TFunc<[FocusEvent<HTMLInputElement>]>;
  onDragEnd: TFunc;
  onDragStart: TFunc;
  onScrub: TFunc<[number]>;
  value: number;
};

export const StrokeWeightField: FC<TStrokeWeightFieldProps> = ({ ariaLabel, onBlur, onDragEnd, onDragStart, onScrub, value }) => (
  <UITools.TextField
    aria-label={ariaLabel}
    defaultValue={`${value}`}
    e2eValue="stroke-weight"
    onBlur={onBlur}
    startAdornment={
      <ScrubbableInput
        max={STROKE_WEIGHT_MAX}
        min={STROKE_WEIGHT_MIN}
        onChange={onScrub}
        onMouseDown={onDragStart}
        onMouseUp={onDragEnd}
        value={value}
      >
        <UITools.InputAdornment icon="Weight" />
      </ScrubbableInput>
    }
    type="text"
  />
);

export default StrokeWeightField;
