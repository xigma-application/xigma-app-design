import { createContext, ReactNode } from 'react';

export const StrokeSettingsDockedPanelContext = createContext<TFunc<[ReactNode]> | null>(null);
