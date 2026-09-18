import { FC } from 'react';

// styles
import styles from './contrast-overlay.module.scss';

// types
import { TContrastBoundary, TContrastCurvePoint } from '../../ContrastChecker/types';

// utils
import { getFailRegionPolygon } from '../../ContrastChecker/utils/getFailRegionPolygon';

export type TContrastOverlayProps = { boundaries: TContrastBoundary[] };

const toSvgPoints = (points: TContrastCurvePoint[]): string => points.map(({ s, v }) => `${s},${100 - v}`).join(' ');

const getVisibleCurve = (points: TContrastCurvePoint[]): TContrastCurvePoint[] => {
  const firstClamped = points.findIndex((point) => point.v >= 100);

  return firstClamped === -1 ? points : points.slice(0, firstClamped + 1);
};

const toClipPathPoints = (points: TContrastCurvePoint[]): string => points.map(({ s, v }) => `${s}% ${100 - v}%`).join(', ');

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
