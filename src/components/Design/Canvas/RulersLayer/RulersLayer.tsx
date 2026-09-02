import { FC, useRef } from 'react';

// core
import { useCanvasRefsContext } from 'components/App/core/CanvasRefsProvider/hooks/useCanvasRefsContext';

// hooks
import { useRulerCanvas } from './hooks/useRulerCanvas';
import { useRulerRenderLoop } from './hooks/useRulerRenderLoop';

// store
import { selectAreRulersVisible } from 'store/design/selectors';
import { useAppSelector } from 'store';

// styles
import styles from './rulers-layer.module.scss';

const RulersLayer: FC = () => {
  const areRulersVisible = useAppSelector(selectAreRulersVisible);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { guides, layout } = useCanvasRefsContext();

  useRulerCanvas(canvasRef, areRulersVisible);
  useRulerRenderLoop(canvasRef, areRulersVisible, layout, guides);

  if (areRulersVisible) {
    return <canvas className={styles.RulersLayer} ref={canvasRef} />;
  }

  return null;
};

export default RulersLayer;
