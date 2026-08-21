import { useEffect } from 'react';

// core
import { useClassNames } from '../../../core/ClassNamesProvider/hooks/useClassNames';

// store
import { selectActiveTool } from 'store/design/selectors';
import { useAppSelector } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { ToolName } from 'types/design/enums';

// utils
import { getCursorClassName } from './utils/getCursorClassName';

export const useDrawingCursor = (refs: TCanvasRefs): void => {
  const { canvasRef } = refs;
  const activeTool = useAppSelector(selectActiveTool);
  const { setClassName } = useClassNames();

  useEffect(() => {
    const canvas = canvasRef.current;

    if (canvas && activeTool !== ToolName.hand) {
      setClassName(getCursorClassName(activeTool));

      return (): void => {
        setClassName(null);
      };
    }
  }, [activeTool, canvasRef, setClassName]);
};
