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
  onChange: TFunc<[number]>;
  onDragEnd?: TFunc;
  onDragStart?: TFunc;
  value: number;
};

export const PatternField: FC<TPatternFieldProps> = ({ ariaLabel, e2eValue, icon, label, onChange, onDragEnd, onDragStart, value }) => {
  const { onBlur, onKeyDown } = usePatternFieldCommit(value, FIELD_MIN, FIELD_MAX, onChange);

  return (
    <TextFieldWrapper
      aria-label={ariaLabel}
      className={styles.PatternField}
      defaultValue={`${value}%`}
      e2eValue={e2eValue}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      startAdornment={
        <ScrubbableInput max={FIELD_MAX} min={FIELD_MIN} onChange={onChange} onMouseDown={onDragStart} onMouseUp={onDragEnd} value={value}>
          {icon ? <Icon color="neutral2" name={icon} size={12} /> : <span className={styles.PatternField__label}>{label}</span>}
        </ScrubbableInput>
      }
      type="text"
    />
  );
};

export default PatternField;
