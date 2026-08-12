import { RefObject, useEffect } from 'react';

// others
import { DRAWING_TOOLS } from '../../constants';

// store
import { selectActiveTool } from 'store/design/selectors';
import { useAppSelector } from 'store';

// styles
import styles from '../../canvas.module.scss';

const DRAWING_CURSOR_CLASS = styles['Canvas__canvas-element--drawing'];

export const useDrawingCursor = (canvasRef: RefObject<HTMLCanvasElement | null>): void => {
  const activeTool = useAppSelector(selectActiveTool);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (canvas) {
      canvas.classList.toggle(DRAWING_CURSOR_CLASS, DRAWING_TOOLS.includes(activeTool));

      return (): void => {
        canvas.classList.remove(DRAWING_CURSOR_CLASS);
      };
    }
  }, [activeTool, canvasRef]);
};
