import { FC } from 'react';

// hooks
import { usePointerDrag } from '../../../hooks/usePointerDrag';

// others
import { SLIDER_THUMB_RADIUS } from '../../../constants';

// styles
import styles from './saturation-map.module.scss';

// types
import { THsv } from '../../../types';

// utils
import { getHueColor } from '../../../utils/getHueColor';
import { getThumbOffset } from '../../../utils/getThumbOffset';

export type TSaturationMapProps = {
  hsv: THsv;
  onChange: TFunc<[Partial<THsv>]>;
  onDragEnd?: TFunc;
  onDragStart?: TFunc;
};

export const SaturationMap: FC<TSaturationMapProps> = ({ hsv, onChange, onDragEnd, onDragStart }) => {
  const { onPointerDown, onPointerMove, onPointerUp, trackRef } = usePointerDrag({
    axis: 'both',
    onChange: ({ x, y }) => onChange({ s: x * 100, v: (1 - y) * 100 }),
    onDragEnd,
    onDragStart,
  });

  return (
    <div className={styles.SaturationMap}>
      <div
        className={styles.SaturationMap__input}
        data-no-drag
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        ref={trackRef}
        style={{ backgroundColor: getHueColor(hsv.h) }}
      >
        <div
          className={styles.SaturationMap__thumb}
          style={{
            left: getThumbOffset(hsv.s / 100, SLIDER_THUMB_RADIUS),
            top: getThumbOffset(1 - hsv.v / 100, SLIDER_THUMB_RADIUS),
          }}
        />
      </div>
    </div>
  );
};

export default SaturationMap;
