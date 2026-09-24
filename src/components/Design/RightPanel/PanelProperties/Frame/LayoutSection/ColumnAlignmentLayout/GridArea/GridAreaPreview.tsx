import { FC } from 'react';

// others
import { MIXED_LABEL } from 'components/Design/RightPanel/PanelProperties/Common/constants';

// styles
import styles from './grid-area-preview.module.scss';

export type TGridAreaPreviewProps = {
  columns: string;
  isMixed?: boolean;
  rows: string;
};

const MAX_PREVIEW_TRACKS = 10;

const MIXED_PREVIEW_TRACKS = 2;

export const GridAreaPreview: FC<TGridAreaPreviewProps> = ({ columns, isMixed = false, rows }) => {
  const targetColumns = isMixed ? MIXED_PREVIEW_TRACKS : Math.min(parseInt(columns, 10) || 0, MAX_PREVIEW_TRACKS);
  const targetRows = isMixed ? MIXED_PREVIEW_TRACKS : Math.min(parseInt(rows, 10) || 0, MAX_PREVIEW_TRACKS);
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
        {isMixed ? (
          MIXED_LABEL
        ) : (
          <>
            {columns} <span>×</span> {rows}
          </>
        )}
      </span>
    </div>
  );
};

export default GridAreaPreview;
