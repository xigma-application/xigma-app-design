import cx from 'classnames';
import { FC, ReactNode } from 'react';

// styles
import styles from '../tree.module.scss';

export type TTreeDropIndicatorProps = {
  children?: ReactNode;
  insertionIndex: number;
  isDefault: boolean;
  rowHeight: number;
};

const TreeDropIndicator: FC<TTreeDropIndicatorProps> = ({ children, insertionIndex, isDefault, rowHeight }) => (
  <div
    className={cx(styles.Tree__dropIndicator, isDefault && styles['Tree__dropIndicator--default'])}
    style={{ transform: `translateY(${insertionIndex * rowHeight}px)` }}
  >
    {children}
  </div>
);

export default TreeDropIndicator;
