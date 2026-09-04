import cx from 'classnames';
import { ChangeEvent, FC, InputHTMLAttributes } from 'react';

// @xigma
import { Icon } from '@xigma/components';

// components
import E2EDataAttribute from 'shared/E2EDataAttributes/E2EDataAttribute';

// styles
import styles from './checkbox.module.scss';

// types
import { E2EAttribute } from 'types/e2e';
import { TE2EValue } from 'shared/E2EDataAttributes/types';

// utils
import { getAttributes } from 'shared/E2EDataAttributes/utils/getAttributes';

export type TCheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'className' | 'color' | 'onChange' | 'value'> & {
  className?: string;
  e2eValue?: TE2EValue;
  isMixed?: boolean;
  label: string;
  onChange: TFunc<[boolean]>;
  value: boolean;
};

export const Checkbox: FC<TCheckboxProps> = ({ className = '', e2eValue = '', isMixed = false, label, onChange, value, ...restProps }) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => onChange(event.target.checked);

  return (
    <E2EDataAttribute type={E2EAttribute.checkbox} value={e2eValue}>
      <div className={cx(styles.Checkbox, className)}>
        <input
          checked={value}
          className={styles.Checkbox__input}
          onChange={handleChange}
          type="checkbox"
          {...getAttributes(E2EAttribute.checkboxInput, e2eValue)}
          {...restProps}
        />
        <div className={styles['Checkbox__input-wrapper']}>
          {isMixed ? <Icon name="CheckboxMixed" size={8} /> : value && <Icon name="Checkbox" size={8} />}
        </div>
        <span className={styles.Checkbox__label}>{label}</span>
      </div>
    </E2EDataAttribute>
  );
};

export default Checkbox;
