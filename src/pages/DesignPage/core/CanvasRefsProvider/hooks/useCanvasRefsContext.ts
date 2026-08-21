import { useContext } from 'react';

// others
import { CanvasRefsContext } from '../context';

// types
import { TCanvasRefs } from 'types/design/canvas/types';

export const useCanvasRefsContext = (): TCanvasRefs => {
  const context = useContext(CanvasRefsContext);

  if (!context) {
    throw new Error('useCanvasRefsContext must be used within a CanvasRefsProvider');
  }

  return context;
};
