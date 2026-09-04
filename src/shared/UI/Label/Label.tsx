import cx from 'classnames';
import { FC, ReactNode } from 'react';

// store
import { selectAreAdditionalLabelsVisible } from 'store/design/selectors';
import { useAppSelector } from 'store';

// styles
import styles from './label.module.scss';

export type TLabelColor = 'secondary';

export type TLabelFontSize = 9 | 11 | 12 | 13;

export type TLabelProps = {
  children: ReactNode;
  className?: string;
  color?: TLabelColor;
  fontSize?: TLabelFontSize;
};

export const Label: FC<TLabelProps> = ({ children, className = '', color, fontSize = 11 }) => {
  const areAdditionalLabelsVisible = useAppSelector(selectAreAdditionalLabelsVisible);

  return areAdditionalLabelsVisible ? (
    <span className={cx(styles.Label, { [styles['Label--secondary']]: color === 'secondary' }, className)} style={{ fontSize }}>
      {children}
    </span>
  ) : null;
};

export default Label;
