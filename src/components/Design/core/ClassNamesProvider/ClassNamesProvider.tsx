import { FC, useState } from 'react';

// others
import { ClassNamesContext } from './context';

// types
import { TClassNamesProviderProps } from './types';

const ClassNamesProvider: FC<TClassNamesProviderProps> = ({ children }) => {
  const [className, setClassName] = useState<string | null>(null);

  return <ClassNamesContext.Provider value={{ className, setClassName }}>{children}</ClassNamesContext.Provider>;
};

export default ClassNamesProvider;
