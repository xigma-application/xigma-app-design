import cx from 'classnames';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// hooks
import { useGradientBarDrag } from './hooks/useGradientBarDrag/useGradientBarDrag';

// styles
import styles from './gradient-bar.module.scss';

// types
import { TEditableGradientStop } from '../types';

// utils
import { getGradientBarBackground } from './utils/getGradientBarBackground';
import { getThumbOffset } from './utils/getThumbOffset';

export type TGradientBarProps = {
  onAddStop: TFunc<[number]>;
  onDragEnd?: TFunc;
  onDragStart?: TFunc;
  onMoveStop: TFunc<[string, number]>;
  onSelectStop: TFunc<[string]>;
  selectedStopId: string | null;
  stops: TEditableGradientStop[];
};

export const GradientBar: FC<TGradientBarProps> = ({
  onAddStop,
  onDragEnd,
  onDragStart,
  onMoveStop,
  onSelectStop,
  selectedStopId,
  stops,
}) => {
  const { t } = useTranslation();
  const { barRef, getThumbHandlers, onTrackPointerDown } = useGradientBarDrag({
    onAddStop,
    onDragEnd,
    onDragStart,
    onMoveStop,
    onSelectStop,
    stops,
  });

  return (
    <div className={styles.GradientBar}>
      <div className={styles.GradientBar__wrapper} data-no-drag onPointerDown={onTrackPointerDown} ref={barRef}>
        <div className={styles.GradientBar__gradient} style={{ backgroundImage: getGradientBarBackground(stops) }} />
        {stops.map((stop) => (
          <button
            aria-label={t('colorPicker.gradient.stops.thumbAriaLabel')}
            className={cx(styles.GradientBar__thumb, { [styles['GradientBar__thumb--selected']]: stop.id === selectedStopId })}
            key={stop.id}
            style={{ left: getThumbOffset(stop.position) }}
            type="button"
            {...getThumbHandlers(stop.id)}
          >
            <span className={styles['GradientBar__thumb-color']} style={{ backgroundColor: stop.color }} />
          </button>
        ))}
      </div>
    </div>
  );
};

export default GradientBar;
