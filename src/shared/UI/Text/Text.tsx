import cx from 'classnames';
import { FC, ReactNode } from 'react';

// store
import { selectAreAdditionalLabelsVisible } from 'store/design/selectors';
import { useAppSelector } from 'store';

// styles
import styles from './text.module.scss';

export type TTextColor = 'secondary';

export type TTextFontSize = 9 | 11 | 12 | 13;

export type TTextProps = {
  children: ReactNode;
  className?: string;
  color?: TTextColor;
  fontSize?: TTextFontSize;
};

export const Text: FC<TTextProps> = ({ children, className = '', color, fontSize = 11 }) => {
  const areAdditionalLabelsVisible = useAppSelector(selectAreAdditionalLabelsVisible);

  return areAdditionalLabelsVisible ? (
    <span className={cx(styles.Text, { [styles['Text--secondary']]: color === 'secondary' }, className)} style={{ fontSize }}>
      {children}
    </span>
  ) : null;
};

export default Text;
