import { FC, useRef } from 'react';

// core
import { useCanvasRefsContext } from 'components/App/core/CanvasRefsProvider/hooks/useCanvasRefsContext';

// hooks
import { useScrollbarDrag } from './hooks/useScrollbarDrag/useScrollbarDrag';
import { useScrollbarsRenderLoop } from './hooks/useScrollbarsRenderLoop/useScrollbarsRenderLoop';

// types
import { TFrozenAxisRange } from './types';

// styles
import styles from './scrollbars-layer.module.scss';

const ScrollbarsLayer: FC = () => {
  const { canvasRef, layout } = useCanvasRefsContext();
  const horizontalDraggingRef = useRef(false);
  const horizontalThumbRef = useRef<HTMLDivElement | null>(null);
  const horizontalTrackRef = useRef<HTMLDivElement | null>(null);
  const verticalDraggingRef = useRef(false);
  const verticalThumbRef = useRef<HTMLDivElement | null>(null);
  const verticalTrackRef = useRef<HTMLDivElement | null>(null);
  const horizontalFrozenRangeRef = useRef<TFrozenAxisRange>(null);
  const verticalFrozenRangeRef = useRef<TFrozenAxisRange>(null);

  useScrollbarsRenderLoop(
    canvasRef,
    layout,
    { horizontalThumbRef, horizontalTrackRef, verticalThumbRef, verticalTrackRef },
    { x: horizontalDraggingRef, y: verticalDraggingRef },
    { x: horizontalFrozenRangeRef, y: verticalFrozenRangeRef },
  );
  useScrollbarDrag('x', canvasRef, layout, horizontalThumbRef, horizontalDraggingRef, horizontalFrozenRangeRef);
  useScrollbarDrag('y', canvasRef, layout, verticalThumbRef, verticalDraggingRef, verticalFrozenRangeRef);

  return (
    <div className={styles.ScrollbarsLayer}>
      <div className={styles['ScrollbarsLayer__horizontal-track']} ref={horizontalTrackRef}>
        <div className={styles['ScrollbarsLayer__horizontal-thumb']} ref={horizontalThumbRef} />
      </div>
      <div className={styles['ScrollbarsLayer__vertical-track']} ref={verticalTrackRef}>
        <div className={styles['ScrollbarsLayer__vertical-thumb']} ref={verticalThumbRef} />
      </div>
    </div>
  );
};

export default ScrollbarsLayer;
