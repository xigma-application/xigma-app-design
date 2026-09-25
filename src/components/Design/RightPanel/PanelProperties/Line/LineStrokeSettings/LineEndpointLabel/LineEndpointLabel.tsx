import cx from 'classnames';
import { FC } from 'react';

// @xigma
import { TIconProps } from '@xigma/components';

// components
import { Icon } from 'shared';

// styles
import styles from './line-endpoint-label.module.scss';

export type TLineEndpointLabelProps = {
  icon: TIconProps['name'];
  isFlipped: boolean;
  label: string;
};

export const LineEndpointLabel: FC<TLineEndpointLabelProps> = ({ icon, isFlipped, label }) => (
  <span className={styles.LineEndpointLabel}>
    <Icon className={cx({ [styles['LineEndpointLabel__icon--flipped']]: isFlipped })} name={icon} size={24} />
    {label}
  </span>
);

export default LineEndpointLabel;
