import { useEffect } from 'react';

// others
import { DRAWING_TOOLS } from '../../constants';
import { useClassNames } from '../../../core/ClassNamesProvider/hooks/useClassNames';

// store
import { selectActiveTool } from 'store/design/selectors';
import { useAppSelector } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { ToolName } from 'types/design/enums';

export const useDrawingCursor = (refs: TCanvasRefs): void => {
  const { canvasRef } = refs;
  const activeTool = useAppSelector(selectActiveTool);
  const { setClassName } = useClassNames();

  useEffect(() => {
    const canvas = canvasRef.current;

    if (canvas && activeTool !== ToolName.hand) {
      setClassName(DRAWING_TOOLS.includes(activeTool) ? 'drawing' : null);

      return (): void => {
        setClassName(null);
      };
    }
  }, [activeTool, canvasRef, setClassName]);
};
