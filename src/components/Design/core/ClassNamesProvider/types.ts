import { PropsWithChildren } from 'react';

export type TClassNamesContextValue = {
  className: string | null;
  setClassName: (className: string | null) => void;
};

export type TClassNamesProviderProps = PropsWithChildren;
