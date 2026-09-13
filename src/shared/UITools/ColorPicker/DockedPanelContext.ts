import { createContext, ReactNode } from 'react';

export const DockedPanelContext = createContext<TFunc<[ReactNode]> | null>(null);
