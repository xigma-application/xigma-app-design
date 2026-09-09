import { FC } from 'react';

// styles
import styles from './grid-area-preview.module.scss';

export type TGridAreaPreviewProps = {
  columns: string;
  rows: string;
};

const MAX_PREVIEW_TRACKS = 10;

export const GridAreaPreview: FC<TGridAreaPreviewProps> = ({ columns, rows }) => {
  const targetColumns = Math.min(parseInt(columns, 10) || 0, MAX_PREVIEW_TRACKS);
  const targetRows = Math.min(parseInt(rows, 10) || 0, MAX_PREVIEW_TRACKS);
  const total = targetColumns * targetRows;

  return (
    <div
      className={styles.GridAreaPreview}
      style={{
        gridTemplateColumns: `repeat(${targetColumns}, 1fr)`,
        gridTemplateRows: `repeat(${targetRows}, 1fr)`,
      }}
    >
      {Array.from({ length: total }, (_cell, index) => (
        <div className={styles.GridAreaPreview__cell} key={index} />
      ))}
      <span className={styles.GridAreaPreview__sizes}>
        {columns} <span>×</span> {rows}
      </span>
    </div>
  );
};

export default GridAreaPreview;
