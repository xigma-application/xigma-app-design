import { FC, useRef } from 'react';

// core
import { useCanvasRefsContext } from 'components/App/core/CanvasRefsProvider/hooks/useCanvasRefsContext';

// hooks
import { useScrollbarDrag } from './hooks/useScrollbarDrag';
import { useScrollbarsRenderLoop } from './hooks/useScrollbarsRenderLoop';

// styles
import styles from './scrollbars-layer.module.scss';

const ScrollbarsLayer: FC = () => {
  const { canvasRef, layout } = useCanvasRefsContext();
  const horizontalThumbRef = useRef<HTMLDivElement | null>(null);
  const horizontalTrackRef = useRef<HTMLDivElement | null>(null);
  const verticalThumbRef = useRef<HTMLDivElement | null>(null);
  const verticalTrackRef = useRef<HTMLDivElement | null>(null);

  useScrollbarsRenderLoop(canvasRef, layout, { horizontalThumbRef, horizontalTrackRef, verticalThumbRef, verticalTrackRef });
  useScrollbarDrag('x', canvasRef, layout, horizontalThumbRef);
  useScrollbarDrag('y', canvasRef, layout, verticalThumbRef);

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
