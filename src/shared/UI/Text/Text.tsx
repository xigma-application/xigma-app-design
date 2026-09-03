import cx from 'classnames';
import { FC, ReactNode } from 'react';

// store
import { selectAreAdditionalLabelsVisible } from 'store/design/selectors';
import { useAppSelector } from 'store';

// styles
import styles from './text.module.scss';

export type TTextFontSize = 9 | 11 | 12 | 13;

export type TTextProps = {
  children: ReactNode;
  className?: string;
  fontSize?: TTextFontSize;
};

export const Text: FC<TTextProps> = ({ children, className = '', fontSize = 11 }) => {
  const areAdditionalLabelsVisible = useAppSelector(selectAreAdditionalLabelsVisible);

  return areAdditionalLabelsVisible ? (
    <span className={cx(styles.Text, className)} style={{ fontSize }}>
      {children}
    </span>
  ) : null;
};

export default Text;
