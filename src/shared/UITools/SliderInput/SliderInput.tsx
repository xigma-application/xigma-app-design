import cx from 'classnames';
import { FC } from 'react';

// @xigma
import { Tooltip } from '@xigma/components';

// components
import ScrubbableEdge from '../ScrubbableEdge/ScrubbableEdge';
import Slider from '../Slider/Slider';
import TextFieldWrapper from '../TextField/TextFieldWrapper/TextFieldWrapper';

// hooks
import { useSliderInputBlur } from './hooks/useSliderInputBlur';

// styles
import styles from './slider-input.module.scss';

export type TSliderInputProps = {
  ariaLabel: string;
  className?: string;
  displayValue?: string;
  e2eValue?: string;
  max: number;
  min: number;
  onChange: TFunc<[number]>;
  onDragEnd?: TFunc;
  onDragStart?: TFunc;
  sliderAriaLabel?: string;
  tooltip?: string;
  value: number;
};

export const SliderInput: FC<TSliderInputProps> = ({
  ariaLabel,
  className = '',
  displayValue,
  e2eValue = '',
  max,
  min,
  onChange,
  onDragEnd,
  onDragStart,
  sliderAriaLabel = `${ariaLabel} slider`,
  tooltip = '',
  value,
}) => {
  const onBlur = useSliderInputBlur(min, max, value, onChange, displayValue);

  return (
    <div className={cx(styles.SliderInput, className)}>
      <div className={styles.SliderInput__slider}>
        <Slider
          ariaLabel={sliderAriaLabel}
          max={max}
          min={min}
          onChange={(next): void => onChange(Math.round(next))}
          onDragEnd={onDragEnd}
          onDragStart={onDragStart}
          value={value}
          variant="compact"
        />
      </div>
      <Tooltip content={tooltip}>
        <TextFieldWrapper
          aria-label={ariaLabel}
          className={styles.SliderInput__input}
          defaultValue={displayValue ?? `${value}`}
          e2eValue={e2eValue}
          onBlur={onBlur}
          startAdornment={
            <ScrubbableEdge max={max} min={min} onChange={onChange} onDragEnd={onDragEnd} onDragStart={onDragStart} value={value} />
          }
          stepNumbers={{ max, min }}
          type="text"
        />
      </Tooltip>
    </div>
  );
};

export default SliderInput;
