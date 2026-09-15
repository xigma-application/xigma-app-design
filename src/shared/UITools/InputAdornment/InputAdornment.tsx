import { FC } from 'react';

// @xigma
import { TIconProps } from '@xigma/components';

// components
import { Icon } from 'shared';

// styles
import styles from './input-adornment.module.scss';

export type TInputAdornmentProps = {
  icon?: TIconProps['name'];
  label?: string;
};

export const InputAdornment: FC<TInputAdornmentProps> = ({ icon, label }) => (
  <div className={styles.InputAdornment}>{icon ? <Icon color="neutral2" name={icon} size={24} /> : label}</div>
);

export default InputAdornment;
