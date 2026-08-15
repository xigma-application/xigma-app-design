import { createContext } from 'react';

// types
import { TClassNamesContextValue } from './types';

export const ClassNamesContext = createContext<TClassNamesContextValue | null>(null);
