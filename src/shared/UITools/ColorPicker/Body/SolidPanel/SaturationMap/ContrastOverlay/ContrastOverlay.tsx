import { FC } from 'react';

// styles
import styles from './contrast-overlay.module.scss';

// types
import { TContrastBoundary } from '../../ContrastChecker/types';

// utils
import { getFailRegionPolygon } from './utils/getFailRegionPolygon';
import { getVisibleCurve } from './utils/getVisibleCurve';
import { toClipPathPoints } from './utils/toClipPathPoints';
import { toSvgPoints } from './utils/toSvgPoints';

export type TContrastOverlayProps = { boundaries: TContrastBoundary[] };

export const ContrastOverlay: FC<TContrastOverlayProps> = ({ boundaries }) => {
  const failRegion = getFailRegionPolygon(boundaries);

  return (
    <div aria-hidden className={styles.ContrastOverlay}>
      {failRegion && <div className={styles.ContrastOverlay__dots} style={{ clipPath: `polygon(${toClipPathPoints(failRegion)})` }} />}
      <svg className={styles.ContrastOverlay__curves} preserveAspectRatio="none" viewBox="0 0 100 100">
        {boundaries.map((boundary) => (
          <polyline
            className={styles.ContrastOverlay__curve}
            fill="none"
            key={boundary.passSide}
            points={toSvgPoints(getVisibleCurve(boundary.points))}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
    </div>
  );
};

export default ContrastOverlay;
