import { FC } from 'react';

// @xigma
import { Tooltip } from '@xigma/components';

// components
import { UITools } from 'shared';

// hooks
import { useGlassNumberBlur } from './hooks/useGlassNumberBlur';

export type TEffectGlassNumberFieldProps = {
  ariaLabel: string;
  displayValue?: string;
  e2eValue: string;
  max: number;
  min: number;
  onChange: TFunc<[number]>;
  onDragEnd?: TFunc;
  onDragStart?: TFunc;
  tooltip: string;
  unit: string;
  value: number;
};

export const EffectGlassNumberField: FC<TEffectGlassNumberFieldProps> = ({
  ariaLabel,
  displayValue,
  e2eValue,
  max,
  min,
  onChange,
  onDragEnd,
  onDragStart,
  tooltip,
  unit,
  value,
}) => {
  const onBlur = useGlassNumberBlur(min, max, displayValue === undefined ? value : undefined, unit, onChange);

  return (
    <Tooltip content={tooltip}>
      <UITools.TextField
        aria-label={ariaLabel}
        defaultValue={displayValue ?? `${value}${unit}`}
        e2eValue={e2eValue}
        onBlur={onBlur}
        startAdornment={
          <UITools.ScrubbableEdge max={max} min={min} onChange={onChange} onDragEnd={onDragEnd} onDragStart={onDragStart} value={value} />
        }
        stepNumbers={{ max, min }}
        type="text"
      />
    </Tooltip>
  );
};

export default EffectGlassNumberField;
