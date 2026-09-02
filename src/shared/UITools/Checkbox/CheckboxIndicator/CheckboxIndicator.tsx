import cx from 'classnames';
import { FC } from 'react';

// @xigma
import { Icon } from '@xigma/components';

// styles
import styles from './checkbox-indicator.module.scss';

export type TCheckboxIndicatorProps = {
  className?: string;
  isMixed?: boolean;
  value: boolean;
};

export const CheckboxIndicator: FC<TCheckboxIndicatorProps> = ({ className = '', isMixed = false, value }) => {
  return (
    <div className={cx(styles.CheckboxIndicator, (value || isMixed) && styles['CheckboxIndicator--checked'], className)}>
      {isMixed && <Icon color="onBlue1" name="CheckboxMixed" size={8} />}
      {value && !isMixed && <Icon color="onBlue1" name="Checkbox" size={9} />}
    </div>
  );
};

export default CheckboxIndicator;
