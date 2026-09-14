import { FC, FocusEvent } from 'react';

// @xigma
import { Icon, ScrubbableInput, TIconProps } from '@xigma/components';

// components
import TextFieldWrapper from 'shared/UITools/TextField/TextFieldWrapper/TextFieldWrapper';

// styles
import styles from './pattern-field.module.scss';

const FIELD_MAX = 1000;
const FIELD_MIN = 0;

export type TPatternFieldProps = {
  ariaLabel: string;
  e2eValue: string;
  icon?: TIconProps['name'];
  label?: string;
  onChange: TFunc<[number]>;
  onDragEnd?: TFunc;
  onDragStart?: TFunc;
  value: number;
};

export const PatternField: FC<TPatternFieldProps> = ({ ariaLabel, e2eValue, icon, label, onChange, onDragEnd, onDragStart, value }) => {
  const handleBlur = (event: FocusEvent<HTMLInputElement>): void => {
    const parsed = Number(event.target.value);
    onChange(Number.isNaN(parsed) ? value : Math.min(FIELD_MAX, Math.max(FIELD_MIN, parsed)));
  };

  return (
    <TextFieldWrapper
      aria-label={ariaLabel}
      className={styles.PatternField}
      defaultValue={value}
      e2eValue={e2eValue}
      endAdornment={<span className={styles.PatternField__unit}>%</span>}
      keepEndAdornmentOnFocus
      max={FIELD_MAX}
      min={FIELD_MIN}
      onBlur={handleBlur}
      startAdornment={
        <ScrubbableInput max={FIELD_MAX} min={FIELD_MIN} onChange={onChange} onMouseDown={onDragStart} onMouseUp={onDragEnd} value={value}>
          {icon ? <Icon color="neutral2" name={icon} size={12} /> : <span className={styles.PatternField__label}>{label}</span>}
        </ScrubbableInput>
      }
      type="number"
    />
  );
};

export default PatternField;
