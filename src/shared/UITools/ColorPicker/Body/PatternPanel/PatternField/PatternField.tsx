import cx from 'classnames';
import { FC } from 'react';

// @xigma
import { ScrubbableInput, TIconProps } from '@xigma/components';

// components
import TextFieldWrapper from 'shared/UITools/TextField/TextFieldWrapper/TextFieldWrapper';

// hooks
import { usePatternFieldCommit } from './hooks/usePatternFieldCommit';

// styles
import styles from './pattern-field.module.scss';
import InputAdornment from 'shared/UITools/InputAdornment/InputAdornment';

const FIELD_MAX = 1000;
const FIELD_MIN = 0;

export type TPatternFieldProps = {
  ariaLabel: string;
  className?: string;
  e2eValue: string;
  icon?: TIconProps['name'];
  adornmentLabel?: string;
  max?: number;
  min?: number;
  onChange: TFunc<[number]>;
  onDragEnd?: TFunc;
  onDragStart?: TFunc;
  suffix?: string;
  value: number;
};

export const PatternField: FC<TPatternFieldProps> = ({
  ariaLabel,
  className,
  e2eValue,
  adornmentLabel,
  icon,
  max = FIELD_MAX,
  min = FIELD_MIN,
  onChange,
  onDragEnd,
  onDragStart,
  suffix = '%',
  value,
}) => {
  const { onBlur, onKeyDown } = usePatternFieldCommit(value, min, max, suffix, onChange);

  return (
    <TextFieldWrapper
      aria-label={ariaLabel}
      className={cx(styles.PatternField, className)}
      defaultValue={`${value}${suffix}`}
      e2eValue={e2eValue}
      onBlur={onBlur}
      stepNumbers={{ max: max, min: min }}
      onKeyDown={onKeyDown}
      startAdornment={
        <ScrubbableInput max={max} min={min} onChange={onChange} onMouseDown={onDragStart} onMouseUp={onDragEnd} value={value}>
          {icon ? <InputAdornment icon={icon} /> : <InputAdornment label={adornmentLabel} />}
        </ScrubbableInput>
      }
      type="text"
    />
  );
};

export default PatternField;
