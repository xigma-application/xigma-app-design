import { useContext } from 'react';

// others
import { ClassNamesContext } from '../context';

// types
import { TClassNamesContextValue } from '../types';

export const useClassNames = (): TClassNamesContextValue => {
  const context = useContext(ClassNamesContext);

  if (!context) {
    throw new Error('useClassNames must be used within a ClassNamesProvider');
  }

  return context;
};
