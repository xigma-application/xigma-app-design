import { FC } from 'react';

// styles
import styles from './grid-track-list.module.scss';

export const GRID_TRACK_ROW_STEP = 32;

export type TGridTrackDropIndicatorProps = {
  index: number;
};

export const GridTrackDropIndicator: FC<TGridTrackDropIndicatorProps> = ({ index }) => (
  <div className={styles.GridTrackDropIndicator} style={{ transform: `translateY(${index * GRID_TRACK_ROW_STEP}px)` }} />
);

export default GridTrackDropIndicator;
