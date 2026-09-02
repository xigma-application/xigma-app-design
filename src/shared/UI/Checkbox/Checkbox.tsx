import cx from 'classnames';
import { ChangeEvent, FC, InputHTMLAttributes } from 'react';

// components
import CheckboxIndicator from './CheckboxIndicator/CheckboxIndicator';

// styles
import styles from './checkbox.module.scss';

export type TCheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'className' | 'color' | 'onChange' | 'value'> & {
  className?: string;
  isMixed?: boolean;
  label: string;
  onChange: TFunc<[boolean]>;
  value: boolean;
};

export const Checkbox: FC<TCheckboxProps> = ({ className = '', isMixed = false, label, onChange, value, ...restProps }) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => onChange(event.target.checked);

  return (
    <label className={cx(styles.Checkbox, className)}>
      <input checked={value} className={styles.Checkbox__input} onChange={handleChange} type="checkbox" {...restProps} />
      <CheckboxIndicator isMixed={isMixed} value={value} />
      <span className={styles.Checkbox__label}>{label}</span>
    </label>
  );
};

export default Checkbox;
