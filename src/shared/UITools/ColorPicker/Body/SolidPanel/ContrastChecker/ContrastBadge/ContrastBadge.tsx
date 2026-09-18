import cx from 'classnames';
import { FC } from 'react';

// components
import { Icon } from 'shared';

// styles
import styles from './contrast-badge.module.scss';

export type TContrastBadgeProps = { label: string; passes: boolean };

export const ContrastBadge: FC<TContrastBadgeProps> = ({ label, passes }) => (
  <span className={cx(styles.ContrastBadge, { [styles['ContrastBadge--pass']]: passes })}>
    {passes && <Icon name="Check" size={12} />}
    <span>{label}</span>
  </span>
);

export default ContrastBadge;
