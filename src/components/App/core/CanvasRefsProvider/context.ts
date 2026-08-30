import { createContext } from 'react';

// types
import { TCanvasRefs } from 'types/design/canvas/types';

export const CanvasRefsContext = createContext<TCanvasRefs | null>(null);
