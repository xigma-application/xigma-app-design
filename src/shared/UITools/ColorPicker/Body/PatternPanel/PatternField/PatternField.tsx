import { FC } from 'react';

// @xigma
import { Icon, ScrubbableInput, TIconProps } from '@xigma/components';

// components
import TextFieldWrapper from 'shared/UITools/TextField/TextFieldWrapper/TextFieldWrapper';

// hooks
import { usePatternFieldCommit } from './hooks/usePatternFieldCommit';

// styles
import styles from './pattern-field.module.scss';

const FIELD_MAX = 1000;
const FIELD_MIN = 0;

export type TPatternFieldProps = {
  ariaLabel: string;
  e2eValue: string;
  icon?: TIconProps['name'];
  label?: string;
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
  e2eValue,
  icon,
  label,
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
      className={styles.PatternField}
      defaultValue={`${value}${suffix}`}
      e2eValue={e2eValue}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      startAdornment={
        <ScrubbableInput max={max} min={min} onChange={onChange} onMouseDown={onDragStart} onMouseUp={onDragEnd} value={value}>
          {icon ? <Icon color="neutral2" name={icon} size={12} /> : <span className={styles.PatternField__label}>{label}</span>}
        </ScrubbableInput>
      }
      type="text"
    />
  );
};

export default PatternField;
