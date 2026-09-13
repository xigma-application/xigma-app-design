import { FC } from 'react';

// hooks
import { usePointerDrag } from '../../../hooks/usePointerDrag';

// styles
import styles from './saturation-map.module.scss';

// types
import { THsv } from '../../../types';

// utils
import { getHueColor } from '../../../utils/getHueColor';
import { getThumbOffset } from '../../../utils/getThumbOffset';

export type TSaturationMapProps = {
  color: string;
  hsv: THsv;
  onChange: TFunc<[Partial<THsv>]>;
  onDragEnd?: TFunc;
  onDragStart?: TFunc;
};

export const SaturationMap: FC<TSaturationMapProps> = ({ color, hsv, onChange, onDragEnd, onDragStart }) => {
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
            backgroundColor: color,
            left: getThumbOffset(hsv.s / 100),
            top: getThumbOffset(1 - hsv.v / 100),
          }}
        />
      </div>
    </div>
  );
};

export default SaturationMap;
