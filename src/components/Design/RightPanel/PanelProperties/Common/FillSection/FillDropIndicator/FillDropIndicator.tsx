import { FC } from 'react';

// styles
import styles from './fill-drop-indicator.module.scss';

export type TFillDropIndicatorProps = {
  offset: number;
};

export const FillDropIndicator: FC<TFillDropIndicatorProps> = ({ offset }) => (
  <div className={styles.FillDropIndicator} style={{ transform: `translateY(${offset}px)` }} />
);

export default FillDropIndicator;
