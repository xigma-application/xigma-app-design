import { FC } from 'react';

// components
import ContrastOverlay from './ContrastOverlay/ContrastOverlay';

// hooks
import { usePointerDrag } from '../../../hooks/usePointerDrag';

// styles
import styles from './saturation-map.module.scss';

// types
import { TContrastBoundary } from '../ContrastChecker/types';
import { THsv } from '../../../types';

// utils
import { getHueColor } from '../../../utils/getHueColor';
import { getThumbOffset } from '../../../utils/getThumbOffset';
import { hsvToRgb } from '../../../utils/hsvToRgb';
import { rgbToHex } from 'utils/color/rgbToHex';

export type TSaturationMapProps = {
  color: string;
  contrastBoundaries?: TContrastBoundary[];
  contrastCorrectionPreview?: THsv | null;
  hsv: THsv;
  onChange: TFunc<[Partial<THsv>]>;
  onDragEnd?: TFunc;
  onDragStart?: TFunc;
};

export const SaturationMap: FC<TSaturationMapProps> = ({ color, contrastBoundaries, contrastCorrectionPreview, hsv, onChange, onDragEnd, onDragStart }) => {
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
        {contrastBoundaries && <ContrastOverlay boundaries={contrastBoundaries} />}
        {contrastCorrectionPreview && (
          <div
            className={styles['SaturationMap__correction-preview']}
            style={{
              backgroundColor: rgbToHex(hsvToRgb(contrastCorrectionPreview)),
              left: getThumbOffset(contrastCorrectionPreview.s / 100),
              top: getThumbOffset(1 - contrastCorrectionPreview.v / 100),
            }}
          />
        )}
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
